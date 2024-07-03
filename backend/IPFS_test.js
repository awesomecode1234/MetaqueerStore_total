const formData = require('form-data');
const fs = require('fs');
const axios = require('axios');

const IPFS_URL = 'https://rpc.particle.network/ipfs/upload';

(async () => {
    const filePath = '1.png';

    const form = new formData();
    form.append('file', fs.createReadStream(filePath));

    let res = await axios.post(IPFS_URL, form, {
        headers: form.getHeaders(),
        auth: {
            username: 'dec8124c-eacd-4328-a719-a92477b32d8c',
            password: 'sFURfNYkyI9FEwITtIuaK1u2aUPvr6C7YTEopih0',
        },
    });

    console.log(res.data);
})();