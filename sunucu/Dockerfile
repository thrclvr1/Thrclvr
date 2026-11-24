# DKAB sunucusu (hesap, bulut kayıt, bildirim, editör PIN sıfırlama) — bağımlılık yok, yalnız Node.js 22.13+
# Derleme (depo kökünden): docker build -f sunucu/Dockerfile -t dkab-sunucu .
FROM node:22-slim
WORKDIR /app
COPY sunucu/sunucu.js sunucu/editor_pin.js ./
ENV NODE_ENV=production PORT=8787 VERITABANI=/veri/dkab.sqlite
# SQLite dosyası kalıcı bir diske bağlanmalı (/veri). Gizli değerler (SMTP parolası vb.) imaja yazılmaz; ortam değişkeniyle verilir.
RUN mkdir -p /veri
VOLUME ["/veri"]
EXPOSE 8787
# Not: barındırma hizmetlerinin kalıcı diskleri çoğunlukla root sahipli bağlanır; bu yüzden kullanıcı değiştirilmez.
CMD ["node", "sunucu.js"]
