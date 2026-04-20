# 🚀 Guia de Deploy - Builders Angola

Este guia descreve como configurar a aplicação em uma VPS Ubuntu e configurar o CI/CD com GitHub Actions.

## 🛠️ Requisitos da VPS
- Sistema: Ubuntu 22.04 LTS (ou superior)
- Memória: Mínimo 1GB RAM recommended.

---

## 1. Preparação do Servidor (Manual pela primeira vez)

### Atualize o sistema
```bash
sudo apt update && sudo apt upgrade -y
```

### Instale o Node.js (via NVM recomendado)
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
nvm install 20 # Ou a versão que preferir
```

### Instale o PM2 (Process Manager)
```bash
npm install -g pm2
```

### Instale e configure o Nginx
```bash
sudo apt install nginx -y
```

Abra o arquivo de configuração do site:
```bash
sudo nano /etc/nginx/sites-available/buildersangola
```

Cole a configuração abaixo (substitua `buildersangola.tech` pelo seu domínio):
```nginx
server {
    listen 80;
    server_name buildersangola.tech www.buildersangola.tech;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Ative o site e reinicie o Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/buildersangola /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Configurar SSL (HTTPS)
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d buildersangola.tech -d www.buildersangola.tech
```

---

## 2. Configuração da Aplicação

### Clone o repositório
```bash
cd /var/www
sudo chown -R $USER:$USER /var/www
git clone https://github.com/ImaCod3r/builders-ao-platform.git
cd builders-ao-platform
```

### Instale dependências e configure o .env
```bash
npm install --production
nano .env
```
_Cole suas variáveis do Supabase no arquivo .env._

### Inicie com PM2
```bash
pm2 start server.js --name "builders-ao"
pm2 save
pm2 startup
```

---

## 3. Configuração de CI/CD (GitHub Actions)

Para que o deploy seja automático a cada `push` na `main`, siga estes passos:

### No GitHub (Secrets)
Vá em `Settings -> Secrets and variables -> Actions` e adicione os seguintes **Repository Secrets**:

1. `HOST`: O IP da sua VPS.
2. `USERNAME`: O usuário da VPS (ex: `ubuntu` ou `root`).
3. `SSH_KEY`: Sua chave privada SSH (gere uma com `ssh-keygen` se não tiver e adicione a pública em `~/.ssh/authorized_keys` no servidor).
4. `PORT`: 22 (ou sua porta SSH).
5. `ENV_FILE`: O conteúdo completo do seu arquivo `.env` (opcional se você criar manualmente o arquivo no servidor).

### O Workflow (.github/workflows/deploy.yml)
Crie o arquivo na pasta `.github/workflows/deploy.yml` no seu repositório:

```yaml
name: Deploy to VPS

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Deploy via SSH
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.HOST }}
          username: ${{ secrets.USERNAME }}
          key: ${{ secrets.SSH_KEY }}
          port: ${{ secrets.PORT }}
          script: |
            cd /var/www/builders-ao-platform
            git pull origin main
            npm install --production
            pm2 restart builders-ao
```

---

## 🔒 Segurança Adicional
- Configure o Firewall: `sudo ufw allow 'Nginx Full' && sudo ufw allow OpenSSH && sudo ufw enable`
- Se puder, use um usuário não-root para rodar o PM2.

---
_Gerado pela Antigravity para Builders Angola._
