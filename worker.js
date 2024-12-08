// 定义允许的用户名和密码
const VALID_CREDENTIALS = {
    username: "航小北",
    password: "buaa"
  };
  
  // CORS 头
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
  
  // 生成传感器选项的函数
  function generateSensorOptions(selectedIndex) {
    let options = '';
    for (let i = 0; i < 16; i++) {
      const value = i + 1;
      options += '<option value="' + value + '"' + 
                 (value === selectedIndex ? ' selected' : '') + 
                 '>传感器' + value + '</option>';
    }
    return options;
  }
  
  // 生成系统页面HTML
  function generateSystemPage() {
    return `
  <!DOCTYPE html>
  <html lang="zh">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>喉镜压力测试系统</title>
    <link rel="icon" type="image/jpeg" href="https://pic.wtr.cc/i/2024/11/29/6749922b0967c.jpeg" />
    <link href="https://cdn1.tianli0.top/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet" />
    <script src="https://cdn1.tianli0.top/npm/plotly.js-dist@2.20.0/plotly.min.js"></script>
    <script src="https://cdn.sheetjs.com/xlsx-0.20.1/package/dist/xlsx.full.min.js"></script>
      <style>
          html, body {
              height: 100vh;
              margin: 0;
              overflow: hidden;
              background-color: #f3f4f6;
          }
          
          .main-container {
              height: 100vh;
              display: flex;
              flex-direction: column;
          }
          
          .content-container {
              flex: 1;
              display: flex;
              gap: 1rem;
              padding: 1rem;
              height: calc(100vh - 3rem); /* 减去导航栏高度 */
              overflow: hidden;
          }
          
          .control-panel {
              width: 300px;
              overflow-y: auto;
              background: white;
              border-radius: 0.5rem;
              box-shadow: 0 1px 3px rgba(0,0,0,0.1);
              padding: 1rem;
          }
          
          .charts-panel {
              flex: 1;
              display: flex;
              flex-direction: column;
              gap: 1rem;
              overflow-y: auto;
              padding-right: 0.5rem;
          }
          
          .chart-container {
              flex: 1 1 0;
              min-height: 0;
              background: white;
              border-radius: 0.5rem;
              box-shadow: 0 1px 3px rgba(0,0,0,0.1);
              padding: 1rem;
              display: flex;
              flex-direction: column;
          }
          
          .chart-inner {
              flex: 1;
              min-height: 0;
              width: 100%;
          }
  
          /* 其他样式保持不变 */
          input, select {
              width: 100%;
              padding: 0.375rem;
              border: 1px solid #e2e8f0;
              border-radius: 0.375rem;
              background-color: white;
              color: #1a202c;
              font-size: 0.875rem;
              line-height: 1.25rem;
              transition: all 0.15s ease-in-out;
          }
  
          input:focus, select:focus {
              outline: none;
              border-color: #3b82f6;
              box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
          }
  
          select {
              appearance: none;
              background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
              background-position: right 0.5rem center;
              background-repeat: no-repeat;
              background-size: 1.5em 1.5em;
              padding-right: 2.5rem;
          }
  
          .form-group {
              margin-bottom: 0.75rem;
          }
  
          .section-title {
              font-size: 1rem;
              font-weight: 600;
              margin-bottom: 0.5rem;
              color: #374151;
          }
  
          .control-panel::-webkit-scrollbar {
              width: 6px;
          }
  
          .control-panel::-webkit-scrollbar-track {
              background: #f1f1f1;
              border-radius: 3px;
          }
  
          .control-panel::-webkit-scrollbar-thumb {
              background: #c1c1c1;
              border-radius: 3px;
          }
  
          .control-panel::-webkit-scrollbar-thumb:hover {
              background: #a8a8a8;
          }
  
          /* 自定义滚动条样式 */
          .charts-panel::-webkit-scrollbar {
              width: 6px;
          }
  
          .charts-panel::-webkit-scrollbar-track {
              background: #f1f1f1;
              border-radius: 3px;
          }
  
          .charts-panel::-webkit-scrollbar-thumb {
              background: #c1c1c1;
              border-radius: 3px;
          }
  
          .charts-panel::-webkit-scrollbar-thumb:hover {
              background: #a8a8a8;
          }
      </style>
  </head>
  <body>
      <div class="main-container">
          <nav class="bg-white shadow-sm h-12 flex items-center px-4">
              <div class="flex justify-between items-center w-full">
                  <span class="text-xl font-bold text-blue-600">喉镜压力测试系统</span>
                  <div class="flex items-center">
                      <span class="text-gray-600 mr-4" id="userName">医生：航小北</span>
                      <button onclick="logout()" class="text-gray-600 hover:text-red-600">退出登录</button>
                  </div>
              </div>
          </nav>
  
          <div class="content-container">
              <!-- 左侧控制面板 -->
              <div class="control-panel">
                  <!-- 串口控制 -->
                  <div class="form-group">
                      <div class="section-title">串口控制</div>
                      <div class="space-y-2">
                          <button onclick="connectSerial()" id="connectBtn" 
                              class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 shadow-sm">
                              连接串口
                          </button>
                          <button onclick="disconnectSerial()" id="disconnectBtn" 
                              class="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 shadow-sm" disabled>
                              断开连接
                          </button>
                          <div class="text-sm text-gray-500" id="connectionStatus">
                              未连接
                          </div>
                      </div>
                  </div>
  
                  <!-- 传感器选择 -->
                  <div class="form-group">
                      <div class="section-title">传感器选择</div>
                      <div class="space-y-2">
                          <select id="sensor1" class="form-select">
                              ${generateSensorOptions(14)}
                          </select>
                          <select id="sensor2" class="form-select">
                              ${generateSensorOptions(15)}
                          </select>
                          <select id="sensor3" class="form-select">
                              ${generateSensorOptions(16)}
                          </select>
                      </div>
                  </div>
  
                  <!-- 用户信息 -->
                  <div class="form-group">
                      <div class="section-title">用户信息</div>
                      <div class="space-y-2">
                          <input type="text" id="patientName" placeholder="请输入患者姓名">
                          <input type="text" id="patientAge" placeholder="请输入患者年龄">
                          <input type="text" id="department" placeholder="请输入科室信息">
                          <input type="text" id="deviceId" placeholder="请输入喉镜编号">
                      </div>
                  </div>
  
                  <!-- 操作按钮 -->
                  <div class="space-y-2 mt-4">
                      <button onclick="startCollection()" id="startBtn" 
                          class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 shadow-sm">
                          开始采集
                      </button>
                      <button onclick="stopCollection()" id="stopBtn" 
                          class="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 shadow-sm" disabled>
                          停止采集
                      </button>
                      <button onclick="exportData()" id="exportBtn" 
                          class="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 shadow-sm">
                          导出数据
                      </button>
                  </div>
              </div>
  
              <!-- 右侧图表区域 -->
              <div class="charts-panel">
                  <div class="chart-container">
                      <div id="chart1" class="chart-inner"></div>
                  </div>
                  <div class="chart-container">
                      <div id="chart2" class="chart-inner"></div>
                  </div>
                  <div class="chart-container">
                      <div id="chart3" class="chart-inner"></div>
                  </div>
              </div>
          </div>
      </div>
  
      <script>
          let port = null;
          let reader = null;
          let keepReading = false;
          let isCollecting = false;
          let allSensorData = {
              timestamp: []
          };
          for (let i = 1; i <= 16; i++) {
              allSensorData['sensor' + i] = [];
          }
  
          // 初始化图表
          function initCharts() {
              const charts = ['chart1', 'chart2', 'chart3'];
              charts.forEach((chartId, index) => {
                  const sensorNum = parseInt(document.getElementById('sensor' + (index + 1)).value);
                  const trace = {
                      x: [],
                      y: [],
                      mode: 'lines',
                      name: '压力值',
                      line: {color: '#2196F3'}
                  };
  
                  const layout = {
                      title: {
                          text: '传感器' + sensorNum + '实时数据',
                          font: {
                              family: 'Microsoft YaHei UI',
                              size: 16
                          }
                      },
                      xaxis: {
                          title: {
                              text: '时间',
                              font: {
                                  family: 'Microsoft YaHei UI'
                              }
                          }
                      },
                      yaxis: {
                          title: {
                              text: '压力 (g)',
                              font: {
                                  family: 'Microsoft YaHei UI'
                              }
                          },
                          range: [0, 2000]
                      },
                      margin: {t: 30, l: 50, r: 30, b: 30},
                      autosize: true,
                      paper_bgcolor: 'white',
                      plot_bgcolor: '#f8fafc'
                  };
  
                  const config = {
                      responsive: true,
                      displayModeBar: false
                  };
  
                  Plotly.newPlot(chartId, [trace], layout, config);
              });
          }
  
          // 更新图表数据
          function updateCharts(values) {
              if (!isCollecting) return;

              const timestamp = new Date().toLocaleTimeString();
              
              // 保存所有传感器的数据
              allSensorData.timestamp.push(timestamp);
              values.forEach((value, index) => {
                  allSensorData['sensor' + (index + 1)].push(value);
              });
              
              // 获取当前选择的传感器
              const selectedSensors = [
                  parseInt(document.getElementById('sensor1').value) - 1,
                  parseInt(document.getElementById('sensor2').value) - 1,
                  parseInt(document.getElementById('sensor3').value) - 1
              ];
  
              // 更新图表显示
              selectedSensors.forEach(function(sensorIndex, i) {
                  const chartId = 'chart' + (i + 1);
                  const sensorData = allSensorData['sensor' + (sensorIndex + 1)];
                  
                  // 计算最大值
                  const maxValue = Math.max(...sensorData);
                  
                  // 只显示最新的30个数据点
                  const displayData = {
                      x: allSensorData.timestamp.slice(-30),
                      y: sensorData.slice(-30)
                  };
                  
                  // 更新图表显示
                  const trace = {
                      x: displayData.x,
                      y: displayData.y,
                      mode: 'lines+markers',
                      line: { 
                          color: '#3B82F6', 
                          width: 2,
                          shape: 'spline',
                          smoothing: 1.3
                      },
                      marker: { 
                          size: 3,
                          color: '#3B82F6'
                      },
                      name: '实时数据'
                  };
                  
                  const layout = {
                      title: {
                          text: '传感器 ' + (sensorIndex + 1) + ' 实时数据<br>最大值: ' + maxValue.toFixed(2) + 'g',
                          font: { size: 14 }
                      },
                      xaxis: { 
                          title: '时间',
                          showgrid: true,
                          gridcolor: '#E5E7EB'
                      },
                      yaxis: { 
                          title: '压力值(g)',
                          showgrid: true,
                          gridcolor: '#E5E7EB'
                      },
                      margin: { t: 50, l: 50, r: 20, b: 40 },
                      height: 250,
                      plot_bgcolor: 'white',
                      paper_bgcolor: 'white'
                  };
                  
                  Plotly.newPlot(chartId, [trace], layout, {
                      responsive: true,
                      displayModeBar: false,
                      showTips: false
                  });
              });
          }
  
          // 开始数据采集
          function startCollection() {
              if (!port) {
                  alert('请先连接串口');
                  return;
              }
              
              isCollecting = true;
              document.getElementById('startBtn').disabled = true;
              document.getElementById('stopBtn').disabled = false;
              
              // 清空所有数据
              allSensorData = {
                  timestamp: []
              };
              for (let i = 1; i <= 16; i++) {
                  allSensorData['sensor' + i] = [];
              }
          }
  
          // 停止数据采集
          function stopCollection() {
              isCollecting = false;
              document.getElementById('startBtn').disabled = false;
              document.getElementById('stopBtn').disabled = true;
          }
  
          // 导出数据为Excel
          function exportData() {
              if (allSensorData.timestamp.length === 0) {
                  alert('没有可导出的数据');
                  return;
              }
              
              const wb = XLSX.utils.book_new();
              
              // 添加患者信息工作表
              const patientInfo = [
                  ['患者信息'],
                  ['姓名', document.getElementById('patientName').value],
                  ['年龄', document.getElementById('patientAge').value],
                  ['科室', document.getElementById('department').value],
                  ['设备编号', document.getElementById('deviceId').value],
                  ['测试时间', new Date().toLocaleString()]
              ];
              const wsPatient = XLSX.utils.aoa_to_sheet(patientInfo);
              XLSX.utils.book_append_sheet(wb, wsPatient, "患者信息");
              
              // 添加数据分析总表
              const analysisData = [
                  ['传感器数据分析'],
                  ['传感器编号', '最大值(g)', '最小值(g)', '平均值(g)', '标准差', '数据点数']
              ];
              
              // 为所有传感器创建数据工作表和计算统计数据
              for (let i = 1; i <= 16; i++) {
                  const sensorData = allSensorData['sensor' + i];
                  
                  // 计算统计数据
                  const max = Math.max(...sensorData);
                  const min = Math.min(...sensorData);
                  const avg = sensorData.reduce((a, b) => a + b, 0) / sensorData.length;
                  const stdDev = Math.sqrt(sensorData.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / sensorData.length);
                  
                  // 添加到分析总表
                  analysisData.push([
                      i,
                      max.toFixed(2),
                      min.toFixed(2),
                      avg.toFixed(2),
                      stdDev.toFixed(2),
                      sensorData.length
                  ]);
                  
                  // 准备传感器数据工作表
                  const data = [
                      ['传感器' + i + '数据记录'],
                      ['时间', '压力值(g)'],
                      ['最大值:', max.toFixed(2)],
                      ['最小值:', min.toFixed(2)],
                      ['平均值:', avg.toFixed(2)],
                      ['标准差:', stdDev.toFixed(2)],
                      ['数据点数:', sensorData.length],
                      [''],
                      ['详细数据:'],
                      ['时间', '压力值(g)']
                  ];
                  
                  // 添加所有数据点
                  for (let j = 0; j < allSensorData.timestamp.length; j++) {
                      data.push([
                          allSensorData.timestamp[j],
                          sensorData[j]
                      ]);
                  }
                  
                  // 创建工作表
                  const ws = XLSX.utils.aoa_to_sheet(data);
                  
                  // 设置列宽
                  ws['!cols'] = [{ wch: 20 }, { wch: 12 }];
                  
                  XLSX.utils.book_append_sheet(wb, ws, "传感器" + i);
              }
              
              // 添加分析总表
              const wsAnalysis = XLSX.utils.aoa_to_sheet(analysisData);
              XLSX.utils.book_append_sheet(wb, wsAnalysis, "数据分析");
              
              // 生成精确到秒的时间戳
              const now = new Date();
              const timestamp = now.getFullYear() + 
                               ('0' + (now.getMonth() + 1)).slice(-2) + 
                               ('0' + now.getDate()).slice(-2) + '_' +
                               ('0' + now.getHours()).slice(-2) + 
                               ('0' + now.getMinutes()).slice(-2) + 
                               ('0' + now.getSeconds()).slice(-2);
              
              // 导出Excel文件
              XLSX.writeFile(wb, 'pressure_data_' + timestamp + '.xlsx');
          }
  
          // 退出登录
          function logout() {
              if (confirm('确定要退出登录吗？')) {
                  window.location.href = '/';
              }
          }
  
          // 页面加载完成后初始化
          document.addEventListener('DOMContentLoaded', () => {
              initCharts();
              
              // 监听传感器选择变化
              ['sensor1', 'sensor2', 'sensor3'].forEach(id => {
                  document.getElementById(id).addEventListener('change', function() {
                      const sensorNum = parseInt(this.value);
                      const chartIndex = parseInt(this.id.replace('sensor', '')) - 1;
                      const chartId = 'chart' + (chartIndex + 1);
                      
                      const layout = {
                          title: {
                              text: '传感器' + sensorNum + '实时数据',
                              font: {
                                  family: 'Microsoft YaHei UI',
                                  size: 16
                              }
                          }
                      };
                      
                      Plotly.relayout(chartId, layout);
                  });
              });
          });
  
          // 串口连接函数
          async function connectSerial() {
              try {
                  // 检查浏览器是否支持Web Serial API
                  if (!navigator.serial) {
                      throw new Error('您的浏览器不支持Web Serial API，请使用Chrome或Edge浏览器');
                  }
  
                  // 请求串口访问权限
                  port = await navigator.serial.requestPort();
                  
                  // 打开串口连接
                  await port.open({
                      baudRate: 115200,
                      dataBits: 8,
                      stopBits: 1,
                      parity: 'none',
                      flowControl: 'none'
                  });
  
                  // 更新UI状态
                  document.getElementById('connectBtn').disabled = true;
                  document.getElementById('disconnectBtn').disabled = false;
                  document.getElementById('connectionStatus').textContent = '已连接';
                  document.getElementById('connectionStatus').style.color = '#10B981';
  
                  // 开始读取数据
                  keepReading = true;
                  startReading();
  
              } catch (error) {
                  console.error('串口连接错误:', error);
                  let errorMessage = '串口连接失败: ';
                  
                  if (error.message.includes('No port selected')) {
                      errorMessage += '未选择串口设备';
                  } else if (error.message.includes('Permission denied')) {
                      errorMessage += '权限被拒绝';
                  } else if (error.message.includes('Failed to open')) {
                      errorMessage += '串口可能被其他程序占用';
                  } else {
                      errorMessage += error.message;
                  }
                  
                  alert(errorMessage);
                  
                  // 重置连接状态
                  document.getElementById('connectBtn').disabled = false;
                  document.getElementById('disconnectBtn').disabled = true;
                  document.getElementById('connectionStatus').textContent = '未连接';
                  document.getElementById('connectionStatus').style.color = '#6B7280';
              }
          }
  
          // 断开串口连接
          async function disconnectSerial() {
              try {
                  keepReading = false;
                  if (reader) {
                      await reader.cancel();
                      reader = null;
                  }
                  if (port) {
                      await port.close();
                      port = null;
                  }
                  
                  // 更新UI状态
                  document.getElementById('connectBtn').disabled = false;
                  document.getElementById('disconnectBtn').disabled = true;
                  document.getElementById('connectionStatus').textContent = '未连接';
                  document.getElementById('connectionStatus').style.color = '#6B7280';
                  
              } catch (error) {
                  console.error('断开连接错误:', error);
                  alert('断开连接时发生错误: ' + error.message);
              }
          }
  
          // 读取串口数据
          async function startReading() {
              while (port && keepReading) {
                  try {
                      reader = port.readable.getReader();
                      
                      while (true) {
                          const { value, done } = await reader.read();
                          if (done) {
                              break;
                          }
                          if (value) {
                              processSerialData(value);
                          }
                      }
                      
                  } catch (error) {
                      console.error('读取数据错误:', error);
                      if (error.message.includes('Port is closed')) {
                          break;
                      }
                  } finally {
                      if (reader) {
                          reader.releaseLock();
                      }
                  }
              }
          }
  
          // 处理串口数据
          function processSerialData(data) {
              // 将接收到的数据转换为文本
              const textDecoder = new TextDecoder();
              const text = textDecoder.decode(data);
              
              try {
                  // 解析数据并更新图表
                  const values = text.trim().split(',').map(Number);
                  if (values.length === 16) {
                      updateCharts(values);
                  }
              } catch (error) {
                  console.error('数据处理错误:', error);
              }
          }
      </script>
  </body>
  </html>
  `;
  }
  
  // 登录页面HTML
  const loginPage = `
  <!DOCTYPE html>
  <html lang="zh">
  <head>
      <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>喉镜压力测试系统</title>
    <link rel="icon" type="image/jpeg" href="https://pic.wtr.cc/i/2024/11/29/6749922b0967c.jpeg" />
    <link href="https://cdn1.tianli0.top/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet" />
  </head>
  <body class="bg-gray-100">
      <div class="min-h-screen flex items-center justify-center">
          <div class="bg-white p-8 rounded-lg shadow-lg w-96">
              <h1 class="text-2xl font-bold text-center text-blue-600 mb-8">喉镜压力测试系统</h1>
              
              <form id="loginForm" class="space-y-6">
                  <div>
                      <label class="block text-sm font-medium text-gray-700">医生姓名</label>
                      <input type="text" id="username" class="mt-1 block w-full px-4 py-3 rounded-md border-2 border-gray-300 bg-gray-50 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors duration-200" required />
                  </div>
                  
                  <div>
                      <label class="block text-sm font-medium text-gray-700">密码</label>
                      <input type="password" id="password" class="mt-1 block w-full px-4 py-3 rounded-md border-2 border-gray-300 bg-gray-50 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors duration-200" required />
                  </div>
                  
                  <button type="submit" class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                      登录
                  </button>
              </form>
              
              <p class="mt-8 text-center text-sm text-gray-500">
                  由清华大学薛拳皇支持开发
              </p>
          </div>
      </div>
      
      <script>
          document.getElementById('loginForm').addEventListener('submit', async (e) => {
              e.preventDefault();
              
              const username = document.getElementById('username').value;
              const password = document.getElementById('password').value;
              
              try {
                  const response = await fetch('/api/login', {
                      method: 'POST',
                      headers: {
                          'Content-Type': 'application/json'
                      },
                      body: JSON.stringify({
                          username,
                          password
                      }),
                      credentials: 'include'
                  });
                  
                  const data = await response.json();
                  
                  if (data.success) {
                      window.location.href = '/system?sessionId=' + data.sessionId;
                  } else {
                      alert(data.message);
                  }
              } catch (err) {
                  alert('登录失败，请稍后重试');
                  console.error('登录错误:', err);
              }
          });
      </script>
  </body>
  </html>
  `;
  
  // 错误处理和API响应
  const ERROR_TYPES = {
    SERIAL: 'serial',
    DATA: 'data',
    AUTH: 'auth',
    VALIDATION: 'validation'
  };
  
  const ERROR_MESSAGES = {
    [ERROR_TYPES.SERIAL]: '串口连接失败',
    [ERROR_TYPES.DATA]: '数据处理错误',
    [ERROR_TYPES.AUTH]: '认证失败',
    [ERROR_TYPES.VALIDATION]: '输入验证失败'
  };
  
  function createResponse(data, status = 200) {
    return new Response(JSON.stringify(data), {
      status,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  }
  
  function handleError(error, type) {
    console.error(`${ERROR_MESSAGES[type]}: ${error.message}`);
    return createResponse({
      success: false,
      message: ERROR_MESSAGES[type],
      error: error.message
    }, 500);
  }
  
  // 修改登录处理函数
  async function handleLogin(data) {
    try {
      if (!data.username || !data.password) {
        throw new Error('用户名和密码不能为空');
      }
  
      const isValid = 
        data.username === VALID_CREDENTIALS.username && 
        data.password === VALID_CREDENTIALS.password;
  
      if (!isValid) {
        return createResponse({
          success: false,
          message: '用户名或密码错误'
        }, 401);
      }
  
      const sessionId = createSession(data.username);
      return createResponse({
        success: true,
        message: '登录成功',
        sessionId
      });
    } catch (error) {
      return handleError(error, ERROR_TYPES.AUTH);
    }
  }
  
  // 请求处理和路由
  const ROUTES = {
    GET: {
      '/': () => new Response(loginPage, {
        headers: { 'Content-Type': 'text/html', ...corsHeaders }
      }),
      '/system': async (request) => {
        // 从 Cookie 或 URL 参数中获取会话ID
        const url = new URL(request.url);
        const sessionId = url.searchParams.get('sessionId') || 
                         request.headers.get('X-Session-ID') ||
                         request.headers.get('Cookie')?.match(/sessionId=([^;]+)/)?.[1];
  
        if (!sessionId || !validateSession(sessionId)) {
          // 如果没有效的会话ID，重定向到登录页面
          return new Response('', {
            status: 302,
            headers: {
              'Location': '/',
              ...corsHeaders
            }
          });
        }
  
        return new Response(generateSystemPage(), {
          headers: { 
            'Content-Type': 'text/html',
            'Set-Cookie': `sessionId=${sessionId}; Path=/; SameSite=Strict`,
            ...corsHeaders 
          }
        });
      }
    },
    POST: {
      '/api/login': async (request) => {
        const data = await request.json();
        const response = await handleLogin(data);
        const responseData = await response.json();
  
        if (responseData.success) {
          // 设置Cookie
          return new Response(JSON.stringify(responseData), {
            headers: {
              'Content-Type': 'application/json',
              'Set-Cookie': `sessionId=${responseData.sessionId}; Path=/; SameSite=Strict`,
              ...corsHeaders
            }
          });
        }
        return response;
      },
      '/api/data': async (request) => {
        try {
          const sessionId = request.headers.get('X-Session-ID');
          if (!validateSession(sessionId)) {
            return createResponse({ message: '请先登录' }, 401);
          }
          
          const data = await request.json();
          const compressedData = compressData(data);
          const analysis = analyzeData(data.y);
          
          DATA_STORE.pressureData.set(sessionId, {
            compressedData,
            analysis,
            timestamp: Date.now()
          });
          
          return createResponse({
            success: true,
            analysis
          });
        } catch (error) {
          return handleError(error, ERROR_TYPES.DATA);
        }
      }
    }
  };
  
  // 处理请求
  async function handleRequest(request) {
    const url = new URL(request.url);
    
    // 处理预检请求
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }
    
    // 路由处理
    const routeHandler = ROUTES[request.method]?.[url.pathname];
    if (routeHandler) {
      try {
        return await routeHandler(request);
      } catch (error) {
        return handleError(error, ERROR_TYPES.VALIDATION);
      }
    }
    
    // 404处理
    return createResponse({ message: '404 Not Found' }, 404);
  }
  
  // 监听请求
  addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request));
  });
  
  // 数据分析以及存储功能
  const DATA_STORE = {
    sessions: new Map(),
    pressureData: new Map()
  };
  
  // 数据分析函数
  function analyzeData(data) {
    if (!data || data.length === 0) return null;
    
    return {
      max: Math.max(...data),
      min: Math.min(...data),
      avg: data.reduce((a, b) => a + b) / data.length,
      variance: calculateVariance(data)
    };
  }
  
  function calculateVariance(data) {
    const mean = data.reduce((a, b) => a + b) / data.length;
    return data.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / data.length;
  }
  
  // 数据压缩函数
  function compressData(data) {
    if (!data || !data.x || !data.y) return null;
    
    return {
      baseTime: data.x[0],
      timeDiffs: data.x.slice(1).map((time, i) => 
        new Date(time).getTime() - new Date(data.x[i]).getTime()),
      values: data.y
    };
  }
  
  // 会话管理
  function createSession(username) {
    const sessionId = crypto.randomUUID();
    const session = {
      username,
      expires: Date.now() + 3600 * 1000 // 1小时过期
    };
    
    DATA_STORE.sessions.set(sessionId, session);
    return sessionId;
  }
  
  function validateSession(sessionId) {
    const session = DATA_STORE.sessions.get(sessionId);
    if (!session) return false;
    return session.expires > Date.now();
  } 
  