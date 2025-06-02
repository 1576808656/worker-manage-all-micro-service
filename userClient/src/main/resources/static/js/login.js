const { createApp } = Vue;
createApp({
    data() {
        return {
            host: 'http://localhost:8110/api/userLogin', // 后端gateway服务器地址
            formData: {
                name: '',
                idcard: '',
                password: ''
            }
        }
    },
    methods: {
        async handleLogin() {
            // 统一身份证号大写
            this.formData.idcard = this.formData.idcard.trim().toUpperCase();
            // 验证身份证号
            if (!/^[0-9Xx]{18}$/.test(this.formData.idcard.trim())) {
                alert('请输入18位有效身份证号（数字或X）');
                return;
            }

            try {
                const response = await fetch(this.host, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                    body: JSON.stringify(this.formData)
                });
                if (!response.ok) {
                    throw new Error(`HTTP错误！状态码：${response.status}`);
                }
                localStorage.setItem('name', this.formData.name);
                localStorage.setItem('idcard', this.formData.idcard);
                await response.json();
                // 跳转到签到页面
                window.location.href = '/signIn';
            } catch (error) {
                alert(`登录失败：${error.message}`);
            }
        }
    }
}).mount('#app');