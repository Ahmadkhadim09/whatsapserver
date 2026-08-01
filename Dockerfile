RUN mkdir -p /app/session && chown -R pptruser:pptruser /app
USER pptruser
RUN whoami && ls -la /app | grep session