from PyQt5 import QtCore, QtWidgets

class Ui_system(object):
    def setupUi(self, system):
        # 设置主窗口
        system.setObjectName("system")
        system.setStyleSheet("""
            QMainWindow {
                background-color: #f5f6fa;
            }
            QGroupBox {
                font-family: "Microsoft YaHei UI";
                font-size: 13px;
                font-weight: bold;
                border: 2px solid #dcdde1;
                border-radius: 8px;
                margin-top: 12px;
                padding: 15px;
                background: rgba(255, 255, 255, 200);
            }
            QGroupBox::title {
                subcontrol-origin: margin;
                subcontrol-position: top center;
                padding: 0 5px;
                color: #2f3542;
                background-color: #f5f6fa;
            }
            QLabel {
                font-family: "Microsoft YaHei UI";
                font-size: 12px;
                color: #2f3542;
            }
            QComboBox {
                border: 1px solid #dcdde1;
                border-radius: 4px;
                padding: 5px;
                min-width: 80px;
                background: white;
            }
            QComboBox:hover {
                border-color: #70a1ff;
            }
            QComboBox::drop-down {
                border: none;
                width: 20px;
            }
            QComboBox::down-arrow {
                image: url(icons/down-arrow.png);
                width: 12px;
                height: 12px;
            }
            QLineEdit {
                border: 1px solid #dcdde1;
                border-radius: 4px;
                padding: 5px;
                background: white;
            }
            QLineEdit:focus {
                border-color: #70a1ff;
            }
            QPushButton {
                background-color: #70a1ff;
                color: white;
                border: none;
                border-radius: 4px;
                padding: 8px 15px;
                font-weight: bold;
            }
            QPushButton:hover {
                background-color: #5352ed;
            }
            QPushButton:pressed {
                background-color: #3742fa;
            }
            QPushButton:disabled {
                background-color: #c8d6e5;
            }
            QTextEdit {
                border: 1px solid #dcdde1;
                border-radius: 4px;
                padding: 5px;
                background: white;
            }
        """)
        
        # 创建中心部件
        self.centralwidget = QtWidgets.QWidget(system)
        
        # 使用 QHBoxLayout 作为主布局
        self.main_layout = QtWidgets.QHBoxLayout(self.centralwidget)
        self.main_layout.setSpacing(20)
        self.main_layout.setContentsMargins(20, 20, 20, 20)
        
        # 创建控制面板
        self.control_panel = QtWidgets.QWidget()
        self.control_panel.setMinimumWidth(350)
        self.control_panel.setMaximumWidth(400)
        self.control_panel_layout = QtWidgets.QVBoxLayout(self.control_panel)
        self.control_panel_layout.setSpacing(15)
        
        # 创建图表面板
        self.charts_panel = QtWidgets.QWidget()
        self.charts_layout = QtWidgets.QVBoxLayout(self.charts_panel)
        self.charts_layout.setSpacing(15)
        
        # 创建三个图表容器
        self.verticalLayoutWidget1 = QtWidgets.QWidget()
        self.verticalLayoutWidget2 = QtWidgets.QWidget()
        self.verticalLayoutWidget3 = QtWidgets.QWidget()
        
        self.verticalLayout1 = QtWidgets.QVBoxLayout(self.verticalLayoutWidget1)
        self.verticalLayout2 = QtWidgets.QVBoxLayout(self.verticalLayoutWidget2)
        self.verticalLayout3 = QtWidgets.QVBoxLayout(self.verticalLayoutWidget3)
        
        # 设置图表容器样式和大小策略
        for widget in [self.verticalLayoutWidget1, self.verticalLayoutWidget2, self.verticalLayoutWidget3]:
            widget.setSizePolicy(
                QtWidgets.QSizePolicy.Expanding,
                QtWidgets.QSizePolicy.Expanding
            )
            widget.setMinimumHeight(250)
            widget.setStyleSheet("""
                QWidget {
                    background: white;
                    border: 2px solid #dcdde1;
                    border-radius: 8px;
                }
            """)
        
        # 将图表容器添加到图表面板
        self.charts_layout.addWidget(self.verticalLayoutWidget1)
        self.charts_layout.addWidget(self.verticalLayoutWidget2)
        self.charts_layout.addWidget(self.verticalLayoutWidget3)
        
        # 实时数据组
        self.data_group = QtWidgets.QGroupBox("实时数据")
        self.data_layout = QtWidgets.QVBoxLayout()
        self.data_layout.setSpacing(15)
        
        # 创建一个网格布局来放置传感器选择器
        sensor_grid = QtWidgets.QGridLayout()
        sensor_grid.setSpacing(10)
        self.sensor_selectors = []
        
        # 创建传感器选择器
        for i in range(3):
            # 创建标签
            label = QtWidgets.QLabel(f"传感器 {14+i}")
            label.setObjectName(f"sensor_label_{i}")
            label.setAlignment(QtCore.Qt.AlignCenter)
            label.setStyleSheet("""
                QLabel {
                    font-family: "Microsoft YaHei UI";
                    font-size: 12px;
                    font-weight: bold;
                    color: #2f3542;
                    padding: 3px;
                    min-width: 100px;
                }
            """)
            sensor_grid.addWidget(label, 0, i)  # 第一行放标签
            
            # 创建下拉框
            selector = QtWidgets.QComboBox()
            selector.addItems([f"传感器{j+1}" for j in range(16)])
            selector.setCurrentIndex(13+i)
            selector.setStyleSheet("""
                QComboBox {
                    min-width: 100px;
                    max-width: 120px;
                    padding: 5px;
                    border: 1px solid #dcdde1;
                    border-radius: 4px;
                    background: white;
                }
                QComboBox:hover {
                    border-color: #70a1ff;
                }
                QComboBox::drop-down {
                    border: none;
                    width: 20px;
                }
                QComboBox::down-arrow {
                    image: url(icons/down-arrow.png);
                    width: 12px;
                    height: 12px;
                }
            """)
            self.sensor_selectors.append(selector)
            sensor_grid.addWidget(selector, 1, i)  # 第二行放下拉框
        
        # 设置列的拉伸因子，使其均匀分布
        for i in range(3):
            sensor_grid.setColumnStretch(i, 1)
        
        # 添加传感器选择网格到主布局
        self.data_layout.addLayout(sensor_grid)
        
        # 数据显示标签也使用网格布局
        data_grid = QtWidgets.QGridLayout()
        data_grid.setSpacing(10)
        
        self.label_data_1 = QtWidgets.QLabel("数据1: 0")
        self.label_data_2 = QtWidgets.QLabel("数据2: 0")
        self.label_data_3 = QtWidgets.QLabel("数据3: 0")
        
        # 设置数据标签的样式和布局
        for i, label in enumerate([self.label_data_1, self.label_data_2, self.label_data_3]):
            label.setAlignment(QtCore.Qt.AlignCenter)
            label.setStyleSheet("""
                QLabel {
                    min-width: 100px;
                    padding: 8px;
                    background: #f1f2f6;
                    border: 1px solid #dcdde1;
                    border-radius: 4px;
                    font-family: "Microsoft YaHei UI";
                    font-size: 13px;
                    font-weight: bold;
                }
            """)
            data_grid.addWidget(label, 0, i)
        
        # 设置数据显示的列拉伸因子
        for i in range(3):
            data_grid.setColumnStretch(i, 1)
        
        self.data_layout.addLayout(data_grid)
        self.data_group.setLayout(self.data_layout)
        self.control_panel_layout.addWidget(self.data_group)
        
        # 用户信息组
        self.user_group = QtWidgets.QGroupBox("用户信息")
        self.user_layout = QtWidgets.QFormLayout()
        
        self.textEdit_name = QtWidgets.QLineEdit()
        self.textEdit_year = QtWidgets.QLineEdit()
        self.textEdit_keshi = QtWidgets.QLineEdit()
        self.textEdit_houjingbianhao = QtWidgets.QLineEdit()
        
        self.user_layout.addRow("姓名:", self.textEdit_name)
        self.user_layout.addRow("年龄:", self.textEdit_year)
        self.user_layout.addRow("科/室/床:", self.textEdit_keshi)
        self.user_layout.addRow("喉镜编号:", self.textEdit_houjingbianhao)
        
        self.user_group.setLayout(self.user_layout)
        self.control_panel_layout.addWidget(self.user_group)
        
        # 通信设置组
        self.comm_group = QtWidgets.QGroupBox("通信设置")
        self.comm_layout = QtWidgets.QFormLayout()
        
        self.comboBox_uart = QtWidgets.QComboBox()
        self.comboBox_boundrate = QtWidgets.QComboBox()
        self.comboBox_boundrate.addItems(["115200"])
        
        self.comm_layout.addRow("串口:", self.comboBox_uart)
        self.comm_layout.addRow("波特率:", self.comboBox_boundrate)
        
        self.comm_group.setLayout(self.comm_layout)
        self.control_panel_layout.addWidget(self.comm_group)
        
        # 操作控制组
        self.button_group = QtWidgets.QGroupBox("操作控制")
        self.button_layout = QtWidgets.QGridLayout()
        
        self.pushButton_start = QtWidgets.QPushButton("开始")
        self.pushButton_pause = QtWidgets.QPushButton("暂停")
        self.pushButton_save_data = QtWidgets.QPushButton("保存数据")
        self.lineEdit_threshold = QtWidgets.QLineEdit()
        self.lineEdit_threshold.setPlaceholderText("输入报警阈值，默认500")
        
        self.button_layout.addWidget(self.pushButton_start, 0, 0)
        self.button_layout.addWidget(self.pushButton_pause, 0, 1)
        self.button_layout.addWidget(self.lineEdit_threshold, 1, 0)
        self.button_layout.addWidget(self.pushButton_save_data, 1, 1)
        
        self.button_group.setLayout(self.button_layout)
        self.control_panel_layout.addWidget(self.button_group)
        
        # 消息记录组
        self.message_group = QtWidgets.QGroupBox("消息记录")
        self.message_layout = QtWidgets.QVBoxLayout()
        
        self.textEdit_message = QtWidgets.QTextEdit()
        self.textEdit_message.setReadOnly(True)
        self.message_layout.addWidget(self.textEdit_message)
        
        self.message_group.setLayout(self.message_layout)
        self.control_panel_layout.addWidget(self.message_group)
        
        # 添加到主布局
        self.main_layout.addWidget(self.control_panel)
        self.main_layout.addWidget(self.charts_panel, stretch=1)
        
        # 设置中心部件
        system.setCentralWidget(self.centralwidget)
        
        # 调整控制面板的宽度
        self.control_panel.setMinimumWidth(350)  # 增加最小宽度
        self.control_panel.setMaximumWidth(400)  # 设置最大宽度
        
        # 设置组件之间的间距
        self.control_panel_layout.setSpacing(15)
        self.control_panel_layout.setContentsMargins(10, 10, 10, 10)
