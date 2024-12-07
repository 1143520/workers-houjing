from PyQt5.QtWidgets import (QApplication, QMainWindow, QMessageBox, QWidget,
                           QGridLayout, QFrame, QVBoxLayout, QHBoxLayout,
                           QLabel, QPushButton, QLineEdit, QFormLayout, QSpacerItem,
                           QSizePolicy, QGraphicsDropShadowEffect, QDesktopWidget)
from PyQt5.QtCore import Qt, QPoint, QPropertyAnimation, QEasingCurve, pyqtProperty, QTimer, QRect
from PyQt5.QtGui import QIcon, QPixmap, QColor, QPainter, QPalette
import sys

class AnimatedLineEdit(QLineEdit):
    def __init__(self, placeholder="", parent=None):
        super(AnimatedLineEdit, self).__init__(parent)  # 修改这里
        self._placeholder_opacity = 1.0
        self._placeholder_text = placeholder
        self._animation = QPropertyAnimation(self, b"placeholder_opacity")  # 修改这里
        self._animation.setDuration(200)
        self.textChanged.connect(self._handle_text_changed)
        self.setPlaceholderText(placeholder)
        
    def _handle_text_changed(self):
        target_opacity = 0.0 if self.text() else 1.0
        self._animation.setStartValue(self._placeholder_opacity)
        self._animation.setEndValue(target_opacity)
        self._animation.start()
        
    @pyqtProperty(float)
    def placeholder_opacity(self):
        return self._placeholder_opacity
        
    @placeholder_opacity.setter
    def placeholder_opacity(self, opacity):
        self._placeholder_opacity = opacity
        self.update()
        
    def get_placeholder_opacity(self):
        return self._placeholder_opacity
        
    def set_placeholder_opacity(self, opacity):
        self._placeholder_opacity = opacity
        self.update()
        
    placeholder_opacity = pyqtProperty(float, get_placeholder_opacity, set_placeholder_opacity)

class ModernLoginWindow(QMainWindow):
    def __init__(self):
        super(ModernLoginWindow, self).__init__()
        # 在创建UI之前设置DPI缩放
        self.setup_dpi_scaling()
        self.init_ui()
        self._init_animations()
        
    def setup_dpi_scaling(self):
        # 获取屏幕信息
        screen = QApplication.primaryScreen()
        dpi = screen.logicalDotsPerInch()
        # 根据DPI调整基础大小
        scale_factor = dpi / 96.0  # 96 DPI是标准DPI
        self.base_width = int(800 * scale_factor)
        self.base_height = int(500 * scale_factor)
        
    def init_ui(self):
        # 修改窗口基础设置
        self.setWindowFlag(Qt.FramelessWindowHint)
        self.setAttribute(Qt.WA_TranslucentBackground)
        self.resize(self.base_width, self.base_height)
        
        # 居中显示
        self.center_window()
        
        # 主布局
        self.central_widget = QWidget()
        self.setCentralWidget(self.central_widget)
        self.layout = QGridLayout(self.central_widget)
        self.layout.setContentsMargins(50, 50, 50, 50)
        
        # 主框架
        self.main_frame = QFrame()
        self.main_frame.setObjectName("mainFrame")
        self.main_layout = QVBoxLayout(self.main_frame)
        self.main_layout.setSpacing(0)
        self.main_layout.setContentsMargins(0, 0, 0, 0)
        
        # 标题栏
        self.title_bar = self._create_title_bar()
        
        # 内容区域
        self.content_widget = self._create_content_area()
        
        # 添加到主布局
        self.main_layout.addWidget(self.title_bar)
        self.main_layout.addWidget(self.content_widget)
        self.layout.addWidget(self.main_frame)
        
        # 应用样式
        self._apply_styles()
        
    def _create_title_bar(self):
        title_bar = QFrame()
        title_bar.setFixedHeight(50)
        title_layout = QHBoxLayout(title_bar)
        title_layout.setContentsMargins(20, 0, 20, 0)
        
        # 标题
        title_label = QLabel("登录")
        title_label.setStyleSheet("color: white; font: 14pt 'Microsoft YaHei UI';")
        
        # 按钮
        close_btn = QPushButton("×")
        close_btn.setFixedSize(30, 30)
        close_btn.clicked.connect(self.close)
        
        title_layout.addWidget(title_label)
        title_layout.addStretch()
        title_layout.addWidget(close_btn)
        
        # 使标题栏可拖动
        title_bar.mousePressEvent = self.mousePressEvent
        title_bar.mouseMoveEvent = self.mouseMoveEvent
        
        return title_bar
        
    def _create_content_area(self):
        content = QWidget()
        content_layout = QVBoxLayout(content)
        content_layout.setAlignment(Qt.AlignHCenter)
        content_layout.setContentsMargins(40, 30, 40, 40)
        content_layout.setSpacing(30)
        
        # 标题
        title = QLabel("喉镜压力测试系统")
        title.setAlignment(Qt.AlignCenter)
        title.setStyleSheet("font: bold 24pt 'Microsoft YaHei UI'; color: #2196F3;")
        
        # 表单
        form = QWidget()
        form_layout = QFormLayout(form)
        form_layout.setSpacing(20)
        form_layout.setContentsMargins(0, 20, 0, 20)
        form_layout.setLabelAlignment(Qt.AlignRight | Qt.AlignVCenter)
        form_layout.setFormAlignment(Qt.AlignHCenter | Qt.AlignVCenter)
        
        # 输入框
        self.username_input = AnimatedLineEdit(placeholder="请输入医生姓名")
        self.password_input = AnimatedLineEdit(placeholder="请输入密码")
        self.password_input.setEchoMode(QLineEdit.Password)
        
        for input_field in (self.username_input, self.password_input):
            input_field.setFixedSize(250, 35)
        
        # 表单标签样式
        label_style = "QLabel { font: 12pt 'Microsoft YaHei UI'; color: #333333; }"
        username_label = QLabel("医生姓名:")
        password_label = QLabel("密码:")
        username_label.setStyleSheet(label_style)
        password_label.setStyleSheet(label_style)
        
        form_layout.addRow(username_label, self.username_input)
        form_layout.addRow(password_label, self.password_input)
        
        # 登录按钮
        self.login_btn = QPushButton("登录")
        self.login_btn.setFixedSize(200, 45)
        self.login_btn.setCursor(Qt.PointingHandCursor)  # 添加鼠标悬停效果
        self.login_btn.clicked.connect(self._handle_login)
        
        content_layout.addWidget(title)
        content_layout.addWidget(form)
        content_layout.addWidget(self.login_btn, 0, Qt.AlignCenter)
        
        # 支持开发信息设置为超链接
        support_label = QLabel()
        support_label.setAlignment(Qt.AlignCenter)
        support_label.setTextFormat(Qt.RichText)
        support_label.setText(
            '<a href="https://www.buaa.edu.cn/" style="color: #666666; text-decoration: none;">'
            '由北京航空航天大学李介博课题组（李祥，范泰霖）支持开发</a>'
        )
        support_label.setOpenExternalLinks(True)  # 启用外部链接
        support_label.setStyleSheet("""
            font: 10pt 'Microsoft YaHei UI';
            margin-top: 20px;
        """)
        content_layout.addWidget(support_label)
        
        return content
        
    def _init_animations(self):
        # 添加阴影效果
        self.shadow = QGraphicsDropShadowEffect(self)
        self.shadow.setBlurRadius(20)
        self.shadow.setXOffset(0)
        self.shadow.setYOffset(5)
        self.shadow.setColor(QColor(0, 0, 0, 80))
        self.main_frame.setGraphicsEffect(self.shadow)
        
        # 登录按钮动画
        self.login_btn_animation = QPropertyAnimation(self.login_btn, b"geometry")
        self.login_btn_animation.setDuration(100)
        self.login_btn_animation.setEasingCurve(QEasingCurve.OutQuad)
        
    def _apply_styles(self):
        # 主框架样式
        self.main_frame.setStyleSheet("""
            #mainFrame {
                background-color: white;
                border-radius: 10px;
            }
        """)
        
        # 标题栏样式
        self.title_bar.setStyleSheet("""
            QFrame {
                background-color: #2196F3;
                border-top-left-radius: 10px;
                border-top-right-radius: 10px;
            }
            QPushButton {
                background-color: transparent;
                border-radius: 15px;
                color: white;
                font: bold 16px;
            }
            QPushButton:hover {
                background-color: #FE575D;
            }
        """)
        
        # 输入框样式
        input_style = """
            QLineEdit {
                padding: 1px 20px;
                border: 2px solid #EEEEEE;
                border-radius: 5px;
                font: 12pt "Microsoft YaHei UI";
                background-color: #FAFAFA;
            }
            QLineEdit:focus {
                border: 2px solid #2196F3;
                background-color: white;
            }
        """
        self.username_input.setStyleSheet(input_style)
        self.password_input.setStyleSheet(input_style)
        
        # 登录按钮样式
        self.login_btn.setStyleSheet("""
            QPushButton {
                background-color: #2196F3;
                color: white;
                border-radius: 22px;
                font: bold 14pt 'Microsoft YaHei UI';
            }
            QPushButton:hover {
                background-color: #1976D2;
            }
            QPushButton:pressed {
                background-color: #0D47A1;
            }
        """)
        
    def mousePressEvent(self, event):
        if event.button() == Qt.LeftButton:
            self.drag_pos = event.globalPos() - self.frameGeometry().topLeft()
            event.accept()
            
    def mouseMoveEvent(self, event):
        if event.buttons() == Qt.LeftButton:
            self.move(event.globalPos() - self.drag_pos)
            event.accept()
            
    def _handle_login(self):
        # 按钮按下动画
        geo = self.login_btn.geometry()
        self.login_btn_animation.setStartValue(geo)
        self.login_btn_animation.setEndValue(geo.adjusted(0, 2, 0, 2))
        self.login_btn_animation.start()
        
        username = self.username_input.text()
        password = self.password_input.text()
        
        if username == "航小北" and password == "buaa":
            try:
                from main_system import my_window
                self.main_window = my_window()
                self.main_window.show()
                self.close()
            except Exception as e:
                QMessageBox.warning(self, '错误', f'创建主窗口失败: {e}')
        else:
            # 显示错误消息
            msg = QMessageBox(self)
            msg.setIcon(QMessageBox.Warning)
            msg.setText('用户名或密码错误')
            msg.setWindowTitle('警告')
            msg.setStyleSheet("""
                QMessageBox {
                    background-color: white;
                }
                QMessageBox QLabel {
                    color: #333;
                    font: 12pt 'Microsoft YaHei UI';
                }
                QPushButton {
                    background-color: #2196F3;
                    color: white;
                    border-radius: 5px;
                    padding: 5px 15px;
                    font: bold 10pt 'Microsoft YaHei UI';
                }
                QPushButton:hover {
                    background-color: #1976D2;
                }
            """)
            msg.exec_()
    
    def center_window(self):
        # 获取屏幕几何信息
        screen = QApplication.primaryScreen()
        screen_geometry = screen.availableGeometry()
        
        # 计算窗口位置使其居中
        x = (screen_geometry.width() - self.width()) // 2
        y = (screen_geometry.height() - self.height()) // 2
        
        # 移动窗口到计算出的位置
        self.setGeometry(x, y, self.width(), self.height())

if __name__ == '__main__':
    # 在创建 QApplication 之前设置高DPI支持
    QApplication.setAttribute(Qt.AA_EnableHighDpiScaling)
    QApplication.setAttribute(Qt.AA_UseHighDpiPixmaps)
    
    app = QApplication(sys.argv)
    
    # 强制使用默认屏幕DPI
    app.setHighDpiScaleFactorRoundingPolicy(
        Qt.HighDpiScaleFactorRoundingPolicy.PassThrough)
    
    window = ModernLoginWindow()
    window.show()
    sys.exit(app.exec_())