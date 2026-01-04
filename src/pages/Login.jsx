* {
  box-sizing: border-box;
  font-family: "Segoe UI", Roboto, sans-serif;
}

.login-page {
  height: 100vh;
  background: url("../assets/fondo.jpg") center / cover no-repeat;
  display: flex;
  justify-content: center;
  align-items: center;
}

.login-card {
  background: #fff;
  width: 360px;
  padding: 32px;
  border-radius: 14px;
  box-shadow: 0 20px 50px rgba(0,0,0,0.25);
  text-align: center;
}

.logo {
  max-width: 210px;
  margin-bottom: 18px;
}

h2 {
  margin: 0 0 18px;
  color: #0b4f1a;
}

.google-btn {
  width: 100%;
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid #ddd;
  background: #fff;
  cursor: pointer;
  font-weight: 600;
}

.google-btn:hover {
  background: #f5f5f5;
}

.divider {
  margin: 16px 0;
  position: relative;
  text-align: center;
}

.divider span {
  background: white;
  padding: 0 10px;
  color: #999;
  font-size: 13px;
}

.divider::before {
  content: "";
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: #ddd;
  z-index: -1;
}

form {
  text-align: left;
}

label {
  font-size: 13px;
  color: #555;
  display: block;
  margin-bottom: 6px;
}

input {
  width: 100%;
  padding: 10px;
  margin: 0 0 14px;
  border-radius: 8px;
  border: 1px solid #ccc;
}

.links {
  text-align: right;
  margin-bottom: 14px;
}

.links a {
  font-size: 12px;
  color: #2a7ae4;
  text-decoration: none;
}

.login-btn {
  width: 100%;
  padding: 12px;
  background: #0b7a2d;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
}

.login-btn:hover {
  background: #096322;
}

.footer {
  margin-top: 14px;
  text-align: center;
}

.footer a {
  font-size: 13px;
  color: #2a7ae4;
  text-decoration: none;
}


