import serial
import serial.tools.list_ports
import random
import time

def list_available_ports():
    """列出所有可用的串口，包括虚拟串口"""
    # 获取系统检测到的串口
    physical_ports = list(serial.tools.list_ports.comports())
    
    # 使用集合来存储已经显示过的端口名称，用于去重
    shown_ports = set()
    all_ports = []
    port_count = 0
    
    print("\n可用的串口列表：")
    
    # 首先处理物理串口
    for port in physical_ports:
        if port.device not in shown_ports:
            port_count += 1
            port_str = f"{port_count}. {port.device} - {port.description}"
            print(port_str)
            all_ports.append((port.device, port.description))
            shown_ports.add(port.device)
    
    # 添加常用的虚拟串口（如果还没有显示过）
    virtual_ports = ['COM1', 'COM2']
    for vport in virtual_ports:
        if vport not in shown_ports:
            try:
                # 尝试临时打开串口来验证其是否可用
                temp_ser = serial.Serial(vport)
                temp_ser.close()
                port_count += 1
                port_str = f"{port_count}. {vport} - Virtual Serial Port"
                if vport == 'COM2':
                    port_str += " (建议用于网页连接)"
                elif vport == 'COM1':
                    port_str += " (建议用于数据模拟器)"
                print(port_str)
                all_ports.append((vport, "Virtual Serial Port"))
                shown_ports.add(vport)
            except:
                continue
    
    if not all_ports:
        print("未检测到任何可用串口")
        print("\n提示：如果要使用虚拟串口，请：")
        print("1. 确保已安装并运行VSPD等虚拟串口软件")
        print("2. 在虚拟串口软件中创建COM1-COM2串口对")
        print("3. 以管理员身份运行此程序")
        return None
        
    return all_ports

def select_port():
    """让用户选择串口"""
    ports = list_available_ports()
    if not ports:
        print("提示：请确保已安装并运行VSPD虚拟串口软件")
        print("1. 安装VSPD软件")
        print("2. 在VSPD中创建虚拟串口对（如COM1-COM2）")
        print("3. 重新运行此程序")
        return None
    
    while True:
        try:
            choice = input("\n请输入要使用的串口编号（输入q退出）: ")
            if choice.lower() == 'q':
                return None
            
            index = int(choice) - 1
            if 0 <= index < len(ports):
                selected_port = ports[index][0]
                if selected_port == 'COM2':
                    print("\n警告：COM2可能已被网页占用，建议使用COM1")
                    confirm = input("是否继续使用COM2？(y/n): ")
                    if confirm.lower() != 'y':
                        continue
                return selected_port
            else:
                print("无效的选择，请重试")
        except ValueError:
            print("请输入有效的数字")

def get_serial_settings():
    """获取串口设置，支持自定义或使用默认值"""
    # 默认设置
    default_settings = {
        'baudrate': 115200,
        'bytesize': 8,
        'parity': 'N',
        'stopbits': 1,
        'timeout': 1
    }
    
    print("\n串口设置（直接回车使用默认值）：")
    print(f"默认波特率: {default_settings['baudrate']}")
    print(f"默认数据位: {default_settings['bytesize']}")
    print(f"默认校验位: {default_settings['parity']}")
    print(f"默认停止位: {default_settings['stopbits']}")
    
    settings = {}
    
    # 获取波特率
    baudrate = input("请输入波特率（默认115200）: ").strip()
    settings['baudrate'] = int(baudrate) if baudrate else default_settings['baudrate']
    
    # 获取数据位
    bytesize = input("请输入数据位（默认8）: ").strip()
    settings['bytesize'] = int(bytesize) if bytesize else default_settings['bytesize']
    
    # 获取校验位
    parity = input("请输入校验位（N/E/O，默认N）: ").strip().upper()
    settings['parity'] = parity if parity in ['N', 'E', 'O'] else default_settings['parity']
    
    # 获取停止位
    stopbits = input("请输入停止位（1/1.5/2，默认1）: ").strip()
    settings['stopbits'] = float(stopbits) if stopbits else default_settings['stopbits']
    
    return settings

def main():
    # 让用户选择串口
    port = select_port()
    if not port:
        print("程序退出")
        return

    try:
        # 获取串口设置
        settings = get_serial_settings()
        
        # 创建串口对象
        ser = serial.Serial(
            port=port,
            baudrate=settings['baudrate'],
            bytesize=settings['bytesize'],
            parity=settings['parity'],
            stopbits=settings['stopbits'],
            timeout=1
        )
        
        print(f"\n串口模拟器已启动...")
        print(f"正在使用端口: {ser.name}")
        print(f"波特率: {settings['baudrate']}")
        print(f"数据位: {settings['bytesize']}")
        print(f"校验位: {settings['parity']}")
        print(f"停止位: {settings['stopbits']}")
        print("按Ctrl+C停止程序")
        
        while True:
            # 生成16个0-2000的随机整数
            random_numbers = [random.randint(0, 2000) for _ in range(16)]
            
            # 将数字转换为逗号分隔的字符串，并添加readSensorData()前缀
            data_string = f"readSensorData(): {','.join(map(str, random_numbers))}\n"
            
            # 发送数据
            ser.write(data_string.encode('ascii'))
            
            # 打印发送的数据
            print(f"已发送: {data_string.strip()}")
            
            # 每100ms发送一次数据
            time.sleep(0.1)
            
    except serial.SerialException as e:
        print(f"\n串口错误: {e}")
        if "PermissionError" in str(e):
            print("\n解决方案：")
            print("1. 请确保VSPD虚拟串口软件正在运行")
            print("2. 检查VSPD中的串口对是否正确配置")
            print("3. 请以管理员身份运行此程序")
            print("4. 确保没有其他程序正在使用该串口")
            print("\n虚拟串口配置说明：")
            print("1. 打开VSPD配置工具")
            print("2. 添加一对虚拟串口（如COM1-COM2）")
            print("3. 确保两个串口都已启用")
    except KeyboardInterrupt:
        print("\n程序停止")
    finally:
        if 'ser' in locals() and ser.is_open:
            ser.close()
            print("串口已关闭")

if __name__ == "__main__":
    main() 