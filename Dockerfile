FROM singlespa/import-map-deployer

COPY conf.js /www/

CMD ["yarn", "start", "conf.js"]
