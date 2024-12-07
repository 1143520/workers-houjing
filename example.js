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
  const sensor1Options = generateSensorOptions(14);
  const sensor2Options = generateSensorOptions(15);
  const sensor3Options = generateSensorOptions(16);
  
  return `
<!DOCTYPE html>
<html lang="zh">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>喉镜压力测试系统 - 主界面</title>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
    <script src="https://cdn.plot.ly/plotly-latest.min.js"></script>
</head>
<body class="bg-gray-100">
    <div class="min-h-screen">
        <nav class="bg-white shadow-lg">
            <div class="max-w-7xl mx-auto px-4">
                <div class="flex justify-between h-16">
                    <div class="flex items-center">
                        <span class="text-xl font-bold text-blue-600">喉镜压力测试系统</span>
                    </div>
                    <div class="flex items-center">
                        <span class="text-gray-600 mr-4" id="userName">医生：航小北</span>
                        <button onclick="logout()" class="text-gray-600 hover:text-red-600">退出登录</button>
                    </div>
                </div>
            </div>
        </nav>

        <div class="max-w-7xl mx-auto px-4 py-6">
            <div class="grid grid-cols-4 gap-6">
                <div class="col-span-1">
                    <div class="bg-white rounded-lg shadow p-6 space-y-6">
                        <!-- 串口控制 -->
                        <div>
                            <h3 class="text-lg font-medium mb-4">串口控制</h3>
                            <div class="space-y-4">
                                <button onclick="connectSerial()" id="connectBtn" 
                                    class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700">
                                    连接串口
                                </button>
                                <button onclick="disconnectSerial()" id="disconnectBtn" 
                                    class="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700" disabled>
                                    断开连接
                                </button>
                                <div class="text-sm text-gray-500" id="connectionStatus">
                                    未连接
                                </div>
                            </div>
                        </div>

                        <!-- 传感器选择 -->
                        <div>
                            <h3 class="text-lg font-medium mb-4">传感器选择</h3>
                            <div class="space-y-4">
                                <select id="sensor1" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                                    ${generateSensorOptions(14)}
                                </select>
                                <select id="sensor2" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                                    ${generateSensorOptions(15)}
                                </select>
                                <select id="sensor3" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                                    ${generateSensorOptions(16)}
                                </select>
                            </div>
                        </div>

                        <!-- 用户信息 -->
                        <div>
                            <h3 class="text-lg font-medium mb-4">用户信息</h3>
                            <div class="space-y-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700">姓名</label>
                                    <input type="text" id="patientName" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700">年龄</label>
                                    <input type="text" id="patientAge" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700">科/室/床</label>
                                    <input type="text" id="department" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700">喉镜编号</label>
                                    <input type="text" id="deviceId" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                                </div>
                            </div>
                        </div>

                        <!-- 操作按钮 -->
                        <div class="space-y-4">
                            <button onclick="startCollection()" id="startBtn" class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700">
                                开始采集
                            </button>
                            <button onclick="stopCollection()" id="stopBtn" class="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700" disabled>
                                停止采集
                            </button>
                            <button onclick="exportData()" id="exportBtn" class="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700">
                                导出数据
                            </button>
                        </div>
                    </div>
                </div>

                <!-- 图表区域 -->
                <div class="col-span-3 space-y-6">
                    <div class="bg-white rounded-lg shadow p-6">
                        <div id="chart1" class="h-64"></div>
                    </div>
                    <div class="bg-white rounded-lg shadow p-6">
                        <div id="chart2" class="h-64"></div>
                    </div>
                    <div class="bg-white rounded-lg shadow p-6">
                        <div id="chart3" class="h-64"></div>
                    </div>
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
                            updateChartsWithRealData(sensorData);
                        }
                    }
                }
            } catch (error) {
                console.error('Error:', error);
                alert('串口连接失败：' + error.message);
                await disconnectSerial();
            }
        }

        async function disconnectSerial() {
            if (reader) {
                isReading = false;
                await reader.cancel();
                await port.close();
                reader = null;
                port = null;
            }
            
            document.getElementById('connectBtn').disabled = false;
            document.getElementById('disconnectBtn').disabled = true;
            document.getElementById('connectionStatus').textContent = '未连接';
            document.getElementById('connectionStatus').className = 'text-sm text-gray-500';
            
            if (isCollecting) {
                stopCollection();
            }

            // 清空所有图表数据并更新标题
            for (let chartId in chartData) {
                chartData[chartId].x = [];
                chartData[chartId].y = [];
                Plotly.purge(chartId);
            }
            initCharts();
        }

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
                    title: port ? ('传感器' + sensorNum + '实时数据') : '请先连接串口设备',
                    xaxis: {title: '时间'},
                    yaxis: {title: '压力 (g)', range: [0, 2000]},
                    margin: {t: 40, l: 60, r: 40, b: 40},
                    height: 250
                };

                Plotly.newPlot(chartId, [trace], layout);
            });
        }

        function updateChartsWithRealData(sensorData) {
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
                const layout = {
                    title: '传感器' + sensorNum + '实时数据',
                    xaxis: {title: '时间'},
                    yaxis: {title: '压力 (g)', range: [0, 2000]},
                    margin: {t: 40, l: 60, r: 40, b: 40},
                    height: 250
                };

                Plotly.update(chartId, update, layout);
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
                initCharts();
            }
        }

        // 停止数据采集
        function stopCollection() {
            isCollecting = false;
            document.getElementById('startBtn').disabled = false;
            document.getElementById('stopBtn').disabled = true;
        }

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

        function logout() {
            if (confirm('确定要退出登录吗？')) {
                window.location.href = '/';
            }
        }

        document.addEventListener('DOMContentLoaded', () => {
            initCharts();
            
            ['sensor1', 'sensor2', 'sensor3'].forEach(id => {
                document.getElementById(id).addEventListener('change', function() {
                    const sensorNum = parseInt(this.value);
                    const chartIndex = parseInt(this.id.replace('sensor', '')) - 1;
                    const chartId = 'chart' + (chartIndex + 1);
                    Plotly.update(chartId, {}, {
                        title: '传感器' + sensorNum + '实时数据'
                    });
                });
            });
        });
    </script>
</body>
</html>`;
}

// 登录页面HTML
const loginPage = `
<!DOCTYPE html>
<html lang="zh">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>喉镜压力测试系统</title>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
</head>
<body class="bg-gray-100">
    <div class="min-h-screen flex items-center justify-center">
        <div class="bg-white p-8 rounded-lg shadow-lg w-96">
            <h1 class="text-2xl font-bold text-center text-blue-600 mb-8">喉镜压力测试系统</h1>
            
            <form id="loginForm" class="space-y-6">
                <div>
                    <label class="block text-sm font-medium text-gray-700">医生姓名</label>
                    <input type="text" id="username" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" required>
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-700">密码</label>
                    <input type="password" id="password" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" required>
                </div>
                
                <button type="submit" class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                    登录
                </button>
            </form>
            
            <p class="mt-8 text-center text-sm text-gray-500">
                由北京航空航天大学李介博课题组（李祥，范泰霖）支持开发
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
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        username,
                        password
                    })
                });
                
                const data = await response.json();
                
                if (data.success) {
                    window.location.href = '/system';
                } else {
                    alert(data.message);
                }
            } catch (err) {
                alert('登录失败，请稍后重试');
            }
        });
    </script>
</body>
</html>
`;

// 处理登录请求
function handleLogin(data) {
  const isValid = 
    data.username === VALID_CREDENTIALS.username && 
    data.password === VALID_CREDENTIALS.password;

  return new Response(
    JSON.stringify({
      success: isValid,
      message: isValid ? "登录成功" : "用户名或密码错误"
    }),
    {
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders
      }
    }
  );
}

// 请求处理
async function handleRequest(request) {
  const url = new URL(request.url);

  if (request.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (request.method === "POST" && url.pathname === "/api/login") {
    const data = await request.json();
    return handleLogin(data);
  }

  if (request.method === "GET") {
    if (url.pathname === "/system") {
      return new Response(generateSystemPage(), {
        headers: { "Content-Type": "text/html", ...corsHeaders }
      });
    }
    
    return new Response(loginPage, {
      headers: { "Content-Type": "text/html", ...corsHeaders }
    });
  }

  return new Response("404 Not Found", { status: 404 });
}

// 监听请求
addEventListener("fetch", event => {
  event.respondWith(handleRequest(event.request));
}); 