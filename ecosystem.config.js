module.exports = {
  apps : [{
    name: 'eosvotes',
    script: 'index.ts',

    // Options reference: https://pm2.io/doc/en/runtime/reference/ecosystem-file/
    autorestart: true
  }],
};
