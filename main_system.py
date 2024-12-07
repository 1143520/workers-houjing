import os
import re
import time
import subprocess
import sys
from collections import deque
import numpy as np
from PyQt5 import QtWidgets, QtCore
from PyQt5.QtCore import QThread, pyqtSignal
from PyQt5.QtWidgets import QFileDialog
from matplotlib.figure import Figure
from matplotlib.backends.backend_qt5agg import FigureCanvasQTAgg as FigureCanvas
from serial import Serial
from PyQt5.QtMultimedia import QSound
from gtts import gTTS
import pygame
from PyQt5.QtCore import QTimer
from matplotlib.dates import DateFormatter
import matplotlib.dates as mdates
from InterfaceUI import Ui_system
from PyQt5.QtWidgets import QDesktopWidget
from PyQt5.QtCore import QRect

# 设置matplotlib的更新参数
import matplotlib
matplotlib.use('Qt5Agg')
matplotlib.rcParams['figure.autolayout'] = True

# 设置中文字体支持
from matplotlib import font_manager as fm
zh_font = fm.FontProperties(fname='C:/Windows/Fonts/simhei.ttf')

class DataBuffer:
    def __init__(self, max_size=100):
        self.max_size = max_size
        self.buffer = deque(maxlen=max_size)
        self.timestamps = deque(maxlen=max_size)
    
    def add_data(self, data, timestamp):
        self.buffer.append(data)
        self.timestamps.append(timestamp)
    
    def get_data(self):
        return list(self.buffer), list(self.timestamps)

class transmitThread(QThread):
    signal_data = pyqtSignal(list, str)

    def __init__(self, serial_port, baud_rate):
        super(transmitThread, self).__init__()
        self.serial_port = serial_port
        self.baud_rate = baud_rate
        self.flag_start = False
        self.flag_uart_state = False
        self.ser = None
        # 添加数据缓冲
        self.data_buffer = []
        self.buffer_size = 5  # 缓冲大小
        
    def port_open(self, flag):
        try:
            if flag and not self.ser:
                self.ser = Serial(self.serial_port, self.baud_rate, timeout=1)  # 添加超时设置
                if self.ser.is_open:
                    self.flag_uart_state = True
                    return True
                else:
                    return False
            elif not flag and self.ser:
                self.close_ser()
            return True
        except Exception as e:
            print(f"串口打开错误: {e}")
            self.flag_uart_state = False
            return False

    def close_ser(self):
        try:
            if self.ser and self.ser.is_open:
                self.ser.close()
            self.ser = None
            self.flag_uart_state = False
        except Exception as e:
            print(f"关闭串口错误: {e}")

    def run(self):
        while True:
            if self.flag_start and self.flag_uart_state and self.ser and self.ser.is_open:
                try:
                    if self.ser.in_waiting:
                        data = self.ser.readline().decode('ascii', errors='ignore').strip()
                        if data:
                            match = re.match(
                                r'.*readSensorData\(\): (\d+,\d+,\d+,\d+,\d+,\d+,\d+,\d+,\d+,\d+,\d+,\d+,\d+,\d+,\d+,\d+)',
                                data)
                            if match:
                                try:
                                    numbers = list(map(int, match.group(1).split(',')))
                                    sensor_data = numbers[-3:]
                                    all_sensor_data = numbers
                                    timestamp = time.strftime('%Y-%m-%d %H:%M:%S', time.localtime())
                                    
                                    # 将数据添加到缓冲区
                                    self.data_buffer.append([sensor_data, all_sensor_data, timestamp])
                                    
                                    # 当缓冲区达到一定大小时，一次性发送数据
                                    if len(self.data_buffer) >= self.buffer_size:
                                        # 发送最新的数据用于显示
                                        self.signal_data.emit(self.data_buffer[-1][0:2], self.data_buffer[-1][2])
                                        # 清空缓冲区
                                        self.data_buffer = []
                                        
                                except (ValueError, IndexError) as e:
                                    print(f"数据解析错误: {e}")
                except Exception as e:
                    print(f"数据读取错误: {e}")
                    self.close_ser()
                    time.sleep(1)
                    self.port_open(True)
            time.sleep(0.05)  # 增加休眠时间，降低CPU占用

class my_window(QtWidgets.QMainWindow, Ui_system):
    def __init__(self):
        super(my_window, self).__init__()
        self.setupUi(self)
        pygame.init()
        
        # 基础设置
        self.threshold_value = 500
        self.alert_shown = False
        self.is_playing_sound = False
        self.thread_img = None
        self.is_collecting = False
        
        # 初始化各种组件
        self.setup_data_buffers()
        self.init_alert_sound()
        self.setup_ui_components()
        self.setup_plots()
        
        # 设置定时器
        self.port_timer = QTimer()
        self.port_timer.timeout.connect(self.update_ports)
        self.port_timer.start(1000)
        self.last_ports = set()
        
        # 添加数据存储变量
        self.current_data_package = None
        self.current_timestamp = None
        self.data_updated = False
        
        # 设置传感器
        self.selected_sensors = [13, 14, 15]
        for i, selector in enumerate(self.sensor_selectors):
            selector.currentIndexChanged.connect(lambda idx, pos=i: self.update_sensor_selection(pos, idx))
        
        # 设置窗口大小和位置
        self.setup_window()
        
    def setup_window(self):
        """设置窗口基本属性"""
        # 获取屏幕尺寸
        screen = QtWidgets.QApplication.primaryScreen().availableGeometry()
        
        # 设置窗口初始大小
        window_width = min(1600, screen.width() - 100)  # 窗口宽度，留出边距
        window_height = min(1000, screen.height() - 100)  # 窗口高度，留出边距
        self.resize(window_width, window_height)  # 使用resize代替setFixedSize
        
        # 计算居中位置
        center_x = (screen.width() - window_width) // 2
        center_y = (screen.height() - window_height) // 2
        
        # 移动窗口到居中位置
        self.move(center_x, center_y)
        
        # 设置窗口标题
        self.setWindowTitle("喉镜压力测试系统")
        
        # 设置窗口最小尺寸
        self.setMinimumSize(800, 600)
        
        # 移除WindowStaysOnTopHint标志，允许窗口最大化
        self.setWindowFlags(QtCore.Qt.Window)
        
    def update_sensor_selection(self, position, new_index):
        """更新选择的传感器"""
        self.selected_sensors[position] = new_index
        
        # 更新传感器选择器上方的标签
        sensor_labels = [widget for widget in self.findChildren(QtWidgets.QLabel) 
                        if widget.text().startswith("传感器")]
        if position < len(sensor_labels):
            sensor_labels[position].setText(f"传感器 {new_index+1}")
        
        # 更新图表标题
        if hasattr(self, 'axes') and self.axes:
            title_dict = {
                0: f"传感器{new_index+1}时数据",
                1: f"传感器{self.selected_sensors[1]+1}实时数据",
                2: f"传感器{self.selected_sensors[2]+1}实时数据"
            }
            self.axes[position].set_title(title_dict[position], fontsize=12, fontweight='bold', fontproperties=zh_font)
            self.canvases[position].draw()

    def setup_data_buffers(self):
        self.data_buffers = [DataBuffer(max_size=100) for _ in range(3)]
        self.data_csv = []
        self.current_values = [0, 0, 0]

    def setup_plots(self):
        self.figures = []
        self.canvases = []
        self.axes = []
        
        # 使用已有的布局
        layouts = [self.verticalLayout1, self.verticalLayout2, self.verticalLayout3]
        titles = ["喉镜上部实时数据", "喉镜中部实时数据", "喉镜下实时数据"]
        
        # 清除布局中已有的内容
        for layout in layouts:
            while layout.count():
                item = layout.takeAt(0)
                if item.widget():
                    item.widget().deleteLater()
        
        for i, (layout, title) in enumerate(zip(layouts, titles)):
            fig = Figure(figsize=(10, 5), dpi=100)
            canvas = FigureCanvas(fig)
            
            # 设置画布的大小策略
            sizePolicy = QtWidgets.QSizePolicy(QtWidgets.QSizePolicy.Expanding,
                                            QtWidgets.QSizePolicy.Expanding)
            canvas.setSizePolicy(sizePolicy)
            
            ax = fig.add_subplot(111)
            ax.set_title(title, fontsize=12, fontweight='bold', fontproperties=zh_font)
            ax.set_xlabel("时间", fontsize=12, fontproperties=zh_font)
            ax.set_ylabel("压力 (g)", fontsize=10, fontproperties=zh_font)
            ax.grid(True, linestyle='--', alpha=0.7)
            ax.set_ylim(0, 2000)  # 设初始y轴范围为0-2000
            
            ax.text(0.02, 0.95, f'当前值: {self.current_values[i]}', 
                transform=ax.transAxes,
                bbox=dict(facecolor='white', alpha=0.8, edgecolor='none'),
                fontsize=10, fontproperties=zh_font)
            
            layout.addWidget(canvas)
            self.figures.append(fig)
            self.canvases.append(canvas)
            self.axes.append(ax)

    def begin_function(self):
        if self.thread_img is not None:
            return

        uart_name = self.comboBox_uart.currentText()
        bound_rate = self.comboBox_boundrate.currentText()

        # 检查输入
        if not uart_name or not bound_rate:
            QtWidgets.QMessageBox.warning(self, '警告', '请选择串口和波特率')
            return

        if not all([self.textEdit_name.text(), 
                    self.textEdit_year.text().isdigit()]):
            QtWidgets.QMessageBox.warning(self, '警告', '请检查用户信息是否完整')
            return

        # 更新阈值
        self.update_threshold_function()

        # 创建并启动线程
        try:
            self.thread_img = transmitThread(uart_name, int(bound_rate))
            if not self.thread_img.port_open(True):
                QtWidgets.QMessageBox.warning(self, '错误', '串口打开失败')
                self.thread_img = None
                return

            self.thread_img.signal_data.connect(self.update_plots)
            self.thread_img.flag_start = True
            self.thread_img.start()

            # 禁用相关控件
            self.textEdit_name.setEnabled(False)
            self.textEdit_year.setEnabled(False)
            self.pushButton_save_data.setEnabled(False)
            self.comboBox_uart.setEnabled(False)  # 禁用串口选择
            self.comboBox_boundrate.setEnabled(False)  # 禁用波特率选择

        except Exception as e:
            QtWidgets.QMessageBox.critical(self, '错误', f'启动失败: {str(e)}')
            self.thread_img = None

    def update_plots_timer(self):
        """定时器调用的更新函数"""
        if self.data_updated and self.current_data_package is not None:
            self.update_plots(self.current_data_package, self.current_timestamp)

    def update_plots(self, data_package, timestamp):
        """处理串口数据的更新函数"""
        # 保存当前数据
        self.current_data_package = data_package
        self.current_timestamp = timestamp
        self.data_updated = True
        
        # 如果不是由定时器调用，直接返回
        if not hasattr(self, '_called_by_timer'):
            return
            
        sensor_data, all_sensor_data = data_package
        
        # 使用选择的传感器数据
        selected_data = [all_sensor_data[i] for i in self.selected_sensors]
        
        # 检查报警使用选择的传感器数据
        self.check_and_alert(selected_data)
        
        # 更新显示部分
        for i in range(len(selected_data)):
            self.current_values[i] = selected_data[i]
        
        # 更新标签文本
        self.label_data_1.setText(f"传感器{self.selected_sensors[0]+1}: {self.current_values[0]:>4}")
        self.label_data_2.setText(f"传感器{self.selected_sensors[1]+1}: {self.current_values[1]:>4}")
        self.label_data_3.setText(f"传感器{self.selected_sensors[2]+1}: {self.current_values[2]:>4}")
        
        # 更新数据缓冲
        for i, buffer in enumerate(self.data_buffers):
            buffer.add_data(selected_data[i], timestamp)
        
        # 图表更新部分
        for i, (fig, canvas, ax) in enumerate(zip(self.figures, self.canvases, self.axes)):
            data, timestamps = self.data_buffers[i].get_data()
            
            ax.clear()
            ax.plot(range(len(data)), data, 'b-', marker='o', markersize=3, linewidth=2)
            ax.axhline(y=self.threshold_value, color='r', linestyle='--', alpha=0.5)
            
            title_dict = {
                0: f"传感器{self.selected_sensors[0]+1}实时数据",
                1: f"传感器{self.selected_sensors[1]+1}实时数据",
                2: f"传感器{self.selected_sensors[2]+1}实时数据"
            }
            ax.set_title(title_dict[i], fontsize=12, fontweight='bold', fontproperties=zh_font)
            ax.grid(True, linestyle='--', alpha=0.7)
            ax.set_xlabel("时间", fontsize=10, fontproperties=zh_font)
            ax.set_ylabel("压力 (g)", fontsize=10, fontproperties=zh_font)

            if data:
                ymax = max(max(data), self.threshold_value)
                margin = max(ymax * 0.1, 200)
                ax.set_ylim(0, ymax + margin)
            else:
                ax.set_ylim(0, 2000)

            if len(timestamps) > 0:
                ax.set_xticks(range(0, len(timestamps), max(1, len(timestamps)//5)))
                ax.set_xticklabels([t.split()[1][3:] for t in timestamps[::max(1, len(timestamps)//5)]], 
                                rotation=45)

            fig.tight_layout(pad=3.0)
            
        # 批量更新所有画布
        for canvas in self.canvases:
            canvas.draw_idle()
        
        self.data_updated = False

    def pause_function(self):
        """修改暂停功能的按钮文本"""
        if not self.thread_img:
            return

        try:
            self.thread_img.flag_start = not self.thread_img.flag_start
            self.thread_img.port_open(self.thread_img.flag_start)

            # 根据状态更新按钮文本
            self.pushButton_pause.setText("继续" if not self.thread_img.flag_start else "暂停")

            # 获取当前状态
            enabled = not self.thread_img.flag_start
            
            # 安全地启用/禁用控件
            for control in [self.textEdit_name, self.textEdit_year, 
                           self.pushButton_save_data, self.comboBox_uart, 
                           self.comboBox_boundrate]:
                if hasattr(self, control.__str__().split('.')[-1]):  # 检查控件是否存在
                    control.setEnabled(enabled)

        except Exception as e:
            QtWidgets.QMessageBox.critical(self, '错误', f'操作失败: {str(e)}')

    def save_csv_function(self):
        """保存数据到CSV文件，包含所有用户输入和16个传感器数据"""
        if not self.data_csv:
            QtWidgets.QMessageBox.warning(self, '警告', '没有数据可保存')
            return

        save_path, _ = QFileDialog.getSaveFileName(self, "保存数据", "", "CSV文件 (*.csv)")
        if save_path:
            try:
                import pandas as pd
                from datetime import datetime
                
                # 获取所有用户输入数据
                user_info = {
                    "姓名": self.textEdit_name.text(),
                    "年龄": self.textEdit_year.text(),
                    "科室床号": self.textEdit_keshi.text(),
                    "喉镜编号": self.textEdit_houjingbianhao.text(),
                    "串口": self.comboBox_uart.currentText(),
                    "波特率": self.comboBox_boundrate.currentText(),
                    "报警阈值": self.lineEdit_threshold.text(),
                    "保存时间": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                }

                # 创建用户信息数据框
                user_info_df = pd.DataFrame([user_info]).T
                user_info_df.columns = ["值"]
                user_info_df.index.name = "参数"

                # 创建包含16个传感器数据的数据
                columns = ["时间戳"] + [f"传感器{i+1}" for i in range(16)]
                sensor_data = pd.DataFrame(self.data_csv, columns=columns)
                
                # 计算每个传感器的统计信息
                stats = {
                    "最大值": sensor_data.iloc[:, 1:].max(),
                    "最小值": sensor_data.iloc[:, 1:].min(),
                    "平均值": sensor_data.iloc[:, 1:].mean(),
                    "标准差": sensor_data.iloc[:, 1:].std()
                }
                stats_df = pd.DataFrame(stats).T

                # 将所有数据写入CSV
                with open(save_path, 'w', newline='', encoding='utf-8-sig') as f:
                    f.write("用户信息\n")
                    user_info_df.to_csv(f)
                    f.write("\n统计信息\n")
                    stats_df.to_csv(f)
                    f.write("\n原始数据\n")
                    sensor_data.to_csv(f, index=False)
                
                QtWidgets.QMessageBox.information(self, '提示', '数据保存成功')
            except Exception as e:
                QtWidgets.QMessageBox.critical(self, '错误', f'保存数据时发生错误：{str(e)}')

    # def save_fig_function(self):
    #     save_path, _ = QFileDialog.getSaveFileName(self, "保存图片", "", "PNG图片 (*.png)")
    #     if save_path:
    #         pixmap = QPixmap(self.size())
    #         self.render(pixmap)
    #         pixmap.save(save_path)
    #         QtWidgets.QMessageBox.information(self, '提示', '图片保存成功')

    def closeEvent(self, event):
        reply = QtWidgets.QMessageBox.question(self, '退出确认', 
                                             '是否要退出程序？',
                                             QtWidgets.QMessageBox.Yes | 
                                             QtWidgets.QMessageBox.No,
                                             QtWidgets.QMessageBox.No)
        
        if reply == QtWidgets.QMessageBox.Yes:
            # 停止定时器
            self.port_timer.stop()
            
            if self.thread_img:
                self.thread_img.close_ser()
                self.thread_img.terminate()
            event.accept()
            os._exit(0)
        else:
            event.ignore()

    def init_alert_sound(self):
        """初始化警报声音"""
        try:
            # 检查 sounds 文件夹是否存在，不存在则创建
            if not os.path.exists('sounds'):
                os.makedirs('sounds')
            
            # 定义本地警报音频文件的路径
            beep_file = 'sounds/alert.wav'
            
            # 如果本地文件不存在则提示用户手动放置文件
            if not os.path.isfile(beep_file):
                print(f"请将音频文件放置在路径: {beep_file}")
            
            # 保存本地音频文件的路径
            self.alert_sound_file = beep_file
        except Exception as e:
            print(f"初始化声音失败: {e}")
            self.alert_sound_file = None

    def setup_ui_components(self):
        """初始化UI组件"""
        # 清空已有选项
        self.comboBox_uart.clear()
        self.comboBox_boundrate.clear()

        # 配置消息记录窗口
        self.textEdit_message.setMinimumHeight(100)
        self.textEdit_message.setSizePolicy(
            QtWidgets.QSizePolicy.Expanding, 
            QtWidgets.QSizePolicy.Expanding
        )

        # 添加波特率选项
        self.comboBox_boundrate.addItems(["115200"])
        
        # 获取系统可用串口
        ports = self.get_available_ports()
        self.comboBox_uart.addItems(ports)
        
        # 设置默认选中为空
        self.comboBox_uart.setCurrentIndex(-1)
        self.comboBox_boundrate.setCurrentIndex(-1)

        # 连接按钮信号
        self.pushButton_start.clicked.connect(self.begin_function)
        self.pushButton_pause.clicked.connect(self.pause_function)
        self.pushButton_save_data.clicked.connect(self.save_csv_function)

    def get_available_ports(self):
        """获取系统可用串口列表"""
        import serial.tools.list_ports
        ports = []
        for p in serial.tools.list_ports.comports():
            ports.append(p.device)
        return ports

    def update_ports(self):
        """实时更新串口列表"""
        try:
            # 获取当前可用的串口列表
            current_ports = set(self.get_available_ports())
            
            # 如果串口列表发生变化
            if current_ports != self.last_ports:
                # 保存当前选中的串口
                current_port = self.comboBox_uart.currentText()
                
                # 清空并重新添加串口列表
                self.comboBox_uart.clear()
                self.comboBox_uart.addItems(sorted(list(current_ports)))
                
                # 如果之前选中的串口仍然存在，则保持选中
                if current_port in current_ports:
                    index = self.comboBox_uart.findText(current_port)
                    self.comboBox_uart.setCurrentIndex(index)
                
                # 更新上次检测到的串口列表
                self.last_ports = current_ports
        except Exception as e:
            print(f"更新串口列表失败: {e}")

    def update_threshold_function(self):
        """更新报警阈值"""
        try:
            threshold_text = self.lineEdit_threshold.text()
            if threshold_text.strip():  # 如果输入不为空
                threshold_value = int(threshold_text)
                if threshold_value > 0:
                    self.threshold_value = threshold_value
                else:
                    QtWidgets.QMessageBox.warning(self, '警告', '阈值必须大于0')
                    self.lineEdit_threshold.setText(str(self.threshold_value))
            else:
                # 如果输入为空使用默认值
                self.lineEdit_threshold.setText(str(self.threshold_value))
        except ValueError:
            QtWidgets.QMessageBox.warning(self, '警告', '请输入有效的整数值')
            self.lineEdit_threshold.setText(str(self.threshold_value))

if __name__ == "__main__":
    app = QtWidgets.QApplication(sys.argv)
    ui = my_window()
    ui.show()
    sys.exit(app.exec_())