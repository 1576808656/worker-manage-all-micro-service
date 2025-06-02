const { createApp } = Vue;
createApp({
    data() {
        return {
            host: 'http://localhost:8110', // 后端gateway服务器地址
            isInRange: false,        // 是否在500米范围内
            isTokenValid: false,     // token是否有效
            error: null,             // 错误信息
            currentCoords: {         // 当前位置
                lat: 0,              // 纬度
                lng: 0               // 经度
            },
             //指定的上班/下班时间
            workTime: "09:00:00",  // 指定上班时间
            goHomeTime: "18:00:00",   // 指定下班时间
            nowtime: '',             // 当前时间
            signIn: {
                name: '',             // 姓名
                idcard: '',           // 身份证号
                dates: '',            // 签到日期
                goWorkTime: '',       // 上班时间
                goHomeTime: '',       // 下班时间
                late: 0,              // 迟到分钟数
                early: 0,             // 早退分钟数
                overtime: 0,          // 加班分钟数
                address: '',          // 签到地址
            },
            targetCoords: {          // 指定签到位置
                lat: 0,        // 纬度
                lng: 0        // 经度
            }
        };
    },
    mounted() {
        // 1. 检查token有效性（无需接收token参数，由后端从Cookie读取）
        this.checkTokenValidity();
        
        this.getLocation().then(async () => {
            // 2. 获取当前位置（等待定位完成）
            await this.getCurrentPosition();
        });
    },
    methods: {
        // 获取经纬度
        async getLocation() {
            const res = await fetch(this.host+'/getLocation',{
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            if(res.ok==false){
                alert('获取位置失败');
                return;
            }
            const data = await res.json();
            this.targetCoords = {
                lat: data.latitude,
                lng: data.longitude,
            };
        },
        // 验证token有效性
        async checkTokenValidity() {
            try {
                const res = await fetch(this.host+'/api/validateToken', {
                    method: 'POST',
                    credentials: "include",
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                this.isTokenValid = res.ok;
                if (res.ok==false)
                    this.redirectToLogin();
            } catch (err) {
                console.error('token验证失败:', err);
                this.redirectToLogin();
            }
        },

        // 获取当前位置
        async getCurrentPosition() {
            // 检查高德地图 API 是否加载完成
            if (!window.AMap) {
                this.error = "高德地图 API 未加载";
                return;
            }
            return new Promise((resolve, reject) => {
                const geolocation = new AMap.Geolocation({
                    enableHighAccuracy: true, // 是否使用高精度定位
                    timeout: 10000,          // 超时时间（毫秒）
                });
                // 发起定位请求
                geolocation.getCurrentPosition((status, result) => {
                    if (status === 'complete') {
                        // 定位成功：更新坐标并计算距离
                        const { lng, lat } = result.position;
                        this.currentCoords.lng = lng; // 更新经度
                        this.currentCoords.lat = lat; // 更新纬度
                        this.error = null;
                        this.calculateDistance(); // 触发距离计算
                        resolve();
                    } else {
                        // 定位失败：补充具体错误类型（如用户拒绝权限、超时等）
                        this.error = `定位失败：${result.message}（${status === 'error' ? '可能是用户拒绝了位置权限' : '超时或其他问题'}）`;
                        reject(new Error(this.error));
                    }
                });
            });
        },

        // 计算与目标位置的距离（Haversine公式）
        calculateDistance() {
            const toRadians = degree => degree * (Math.PI / 180);
      
            const lat1 = toRadians(this.currentCoords.lat);
            const lng1 = toRadians(this.currentCoords.lng);
            const lat2 = toRadians(this.targetCoords.lat);
            const lng2 = toRadians(this.targetCoords.lng);
      
            // Haversine公式
            const dLat = lat2 - lat1;
            const dLng = lng2 - lng1;
            
            const a = 
                Math.sin(dLat/2) ** 2 + 
                Math.cos(lat1) * Math.cos(lat2) * 
                Math.sin(dLng/2) ** 2;
              
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
            
            // 地球半径（公里）
            const R = 6371;
            this.distance = (R * c).toFixed(2);
            this.isInRange = this.distance <= 0.5; // 500米范围内
      
            // 添加经纬度格式化（保留4位小数）
            const formatCoord = (num) => num.toFixed(4);
            alert('当前位置：' + formatCoord(this.currentCoords.lat) + ',' + formatCoord(this.currentCoords.lng) + '\n' 
                + '签到位置：' + formatCoord(this.targetCoords.lat) + ',' + formatCoord(this.targetCoords.lng) + '\n' 
                + '距离：' + this.distance + 'km');
        },

        // 跳转登录页（修改：无需清除localStorage的token）
        redirectToLogin() {
            window.location.href = '/login';
        },

        // 获取当前时间并分割年月日/时分秒
        getCurrentTime() {
            const now = new Date();
            // 北京时间处理（UTC+8）
            const beijingTime = new Date(now.getTime() + (8 * 60 - now.getTimezoneOffset()) * 60000);
            
            // 提取年月日（格式：YYYY-MM-DD）
            const year = beijingTime.getFullYear();
            const month = String(beijingTime.getMonth() + 1).padStart(2, '0'); // 月份从0开始
            const day = String(beijingTime.getDate()).padStart(2, '0');
            this.signIn.dates = `${year}-${month}-${day}`;
        
            // 提取时分秒（格式：HH:mm:ss）
            const hours = String(beijingTime.getHours()).padStart(2, '0');
            const minutes = String(beijingTime.getMinutes()).padStart(2, '0');
            const seconds = String(beijingTime.getSeconds()).padStart(2, '0');
            this.nowtime = `${hours}:${minutes}:${seconds}`;
        },

        async signIn() {
            this.signIn.name = localStorage.getItem('name'); // 从localStorage获取姓名
            this.signIn.idcard = localStorage.getItem('idcard'); // 从localStorage获取身份证号
            this.signIn.address = this.convertToAddress(this.currentCoords.lat, this.currentCoords.lng); // 获取当前地址
            try {
                await fetch(this.host+'/api/signIn',{
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(this.signIn)
                });
            }catch(err){
                alert('签到失败：'+err.message);
            }
        },
        // 处理签到操作（无需手动传递token，由Cookie携带）
        async handleSignIn() {
            // 检查当前签到时间是否在9:00-18:00之间

            this.getCurrentTime(); // 获取当前时间
            try {
                this.signIn.name = localStorage.getItem('name'); // 从localStorage获取姓名
                this.signIn.idcard = localStorage.getItem('idcard'); // 从localStorage获取身份证号
                // 检查是否已经签到
                const res = await fetch(this.host+'/api/checkSignIn', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        name: localStorage.getItem('name'), // 从localStorage获取姓名
                        idcard: localStorage.getItem('idcard'), // 从localStorage获取身份证号
                    })
                });
                const data = await res.json();
                if(data.ifSignIn==false){    //如果没有签到
                    this.signIn.goWorkTime = this.nowtime; // 记录上班时间
                    this.checkSignInTime(); // 计算迟到时间
                    this.signIn();
                }
                else{
                    alert(`签到失败：${data.message}`);
                }
            } catch (err) {
                alert(`签到异常：${err.message}`);
            }
        },
        // 将经纬度转换为地址（高德逆地理编码）
        convertToAddress(lat, lng) {
            return new Promise((resolve, reject) => {
                // 高德API参数顺序为 [经度, 纬度]
                const lnglat = [lng, lat];
                const geocoder = new AMap.Geocoder();
                
                geocoder.getAddress(lnglat, (status, result) => {
                    if (status === 'complete' && result.info === 'OK') {
                        const address = result.regeocode.formattedAddress; // 完整地址
                        this.signIn.address = address; // 更新签到地址
                        resolve(address);
                    } else {
                        this.error = '地址转换失败，请重试';
                        reject(new Error('逆地理编码失败'));
                    }
                });
            });
        }
    },
    checkSignInTime() {
        this.signIn.late = this.calculateTimeDifference(this.workTime); // 计算上班时间
        if(this.signIn.late<0)
            this.signIn.late = 0; // 迟到时间不能为负数
    },
    checkSignOutTime() {
        this.signIn.early = this.calculateTimeDifference(this.goHomeTime); // 计算下班时间
        if(this.signIn.early<0)
            this.signIn.early = Math.abs(this.signIn.early); // 早退时间不能为负数
        else{
            this.signIn.overtime = this.signIn.early; // 计算加班时间
            this.signIn.early = 0;
        }
    },
    // 计算当前时间与指定时间的差值（分钟）
    calculateTimeDifference(time) {
        // 解析预设时间
        const [workH, workM,workS] = time.split(':').map(Number);
        const workTotal = workH * 600 + workM*60 + workS;
    
        // 解析当前签到时间（例如"09:30:15"）
        const [currentH, currentM,currentS] = this.nowtime.split(':').map(Number);
        const currentTotal = currentH * 600 + currentM*60 + currentS;
    
        // 计算差值
        return currentTotal - workTotal;
    }
}).mount('#app');