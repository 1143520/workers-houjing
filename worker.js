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
          let isReading = false;
          let isCollecting = false;
          let chartData = {
              chart1: { x: [], y: [] },
              chart2: { x: [], y: [] },
              chart3: { x: [], y: [] }
          };
  
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
          async function updateChartsWithRealData(sensorData) {
              if (!isCollecting || !port) return;
  
              const now = new Date();
              const timeStr = now.toLocaleTimeString();
  
              for (let i = 0; i < 3; i++) {
                  const chartId = 'chart' + (i + 1);
                  const value = sensorData[i];
  
                  if (chartData[chartId].x.length > 100) {
                      chartData[chartId].x.shift();
                      chartData[chartId].y.shift();
                  }
  
                  chartData[chartId].x.push(timeStr);
                  chartData[chartId].y.push(value);
  
                  const sensorNum = parseInt(document.getElementById('sensor' + (i + 1)).value);
                  const update = {
                      x: [chartData[chartId].x],
                      y: [chartData[chartId].y]
                  };
  
                  Plotly.update(chartId, update);
              }
  
              // 发送数据到服务器进行分析
              if (chartData.chart1.y.length > 0) {
                  const result = await sendDataToServer({
                      x: chartData.chart1.x,
                      y: chartData.chart1.y
                  });
                  
                  if (result?.analysis) {
                      updateAnalysis(result.analysis);
                  }
              }
          }
  
          // 开始数据采集
          function startCollection() {
              if (!port) {
                  alert('请先连接串口设备');
                  return;
              }
              
              isCollecting = true;
              document.getElementById('startBtn').disabled = true;
              document.getElementById('stopBtn').disabled = false;
              
              // 清空所有图表数据
              for (let chartId in chartData) {
                  chartData[chartId].x = [];
                  chartData[chartId].y = [];
                  Plotly.purge(chartId);
              }
              initCharts();
          }
  
          // 停止数据采集
          function stopCollection() {
              isCollecting = false;
              document.getElementById('startBtn').disabled = false;
              document.getElementById('stopBtn').disabled = true;
          }
  
          // 导出数据
          function exportData() {
              const data = {
                  patientInfo: {
                      name: document.getElementById('patientName').value,
                      age: document.getElementById('patientAge').value,
                      department: document.getElementById('department').value,
                      deviceId: document.getElementById('deviceId').value
                  },
                  sensorData: chartData
              };
  
              const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'pressure_data_' + new Date().toISOString().split('T')[0] + '.json';
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(url);
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
                  if (!navigator.serial) {
                      throw new Error('您的浏览器不支持Web Serial API，请使用Chrome或Edge浏览器');
                  }
  
                  port = await navigator.serial.requestPort();
                  await port.open({ baudRate: 115200 });
                  
                  document.getElementById('connectBtn').disabled = true;
                  document.getElementById('disconnectBtn').disabled = false;
                  document.getElementById('connectionStatus').textContent = '已连接';
                  document.getElementById('connectionStatus').className = 'text-sm text-green-600';
                  
                  reader = port.readable.getReader();
                  isReading = true;
  
                  let buffer = '';
                  while (isReading) {
                      try {
                          const { value, done } = await reader.read();
                          if (done) break;
                          
                          buffer += new TextDecoder().decode(value);
                          
                          let lineEnd;
                          while ((lineEnd = buffer.indexOf('\\n')) !== -1) {
                              const line = buffer.slice(0, lineEnd);
                              buffer = buffer.slice(lineEnd + 1);
                              
                              const match = line.match(/readSensorData\\(\\): ([\\d,]+)/);
                              if (match) {
                                  const numbers = match[1].split(',').map(Number);
                                  const selectedSensors = [
                                      parseInt(document.getElementById('sensor1').value) - 1,
                                      parseInt(document.getElementById('sensor2').value) - 1,
                                      parseInt(document.getElementById('sensor3').value) - 1
                                  ];
                                  const sensorData = selectedSensors.map(index => numbers[index]);
                                  await updateChartsWithRealData(sensorData);
                              }
                          }
                      } catch (error) {
                          console.error('读取数据错误:', error);
                          break;
                      }
                  }
              } catch (error) {
                  console.error('串口连接错误:', error);
                  alert('串口连接失败：' + error.message);
                  await disconnectSerial();
              }
          }
  
          // 断开串口连接
          async function disconnectSerial() {
              try {
                  if (reader) {
                      isReading = false;
                      await reader.cancel();
                      reader = null;
                  }
                  
                  if (port) {
                      await port.close();
                      port = null;
                  }
                  
                  document.getElementById('connectBtn').disabled = false;
                  document.getElementById('disconnectBtn').disabled = true;
                  document.getElementById('connectionStatus').textContent = '未连接';
                  document.getElementById('connectionStatus').className = 'text-sm text-gray-500';
                  
                  if (isCollecting) {
                      stopCollection();
                  }
  
                  // 清空所有图表数据
                  for (let chartId in chartData) {
                      chartData[chartId].x = [];
                      chartData[chartId].y = [];
                      Plotly.purge(chartId);
                  }
                  initCharts();
              } catch (error) {
                  console.error('断开连接错误:', error);
                  alert('断开连接失败：' + error.message);
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
                  由清华大学薛某支持开发
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
  
  // 数据分析和存储功能
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
        new Date(time) - new Date(data.x[i])),
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
  