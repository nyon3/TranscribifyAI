// lib/test.ts

const { getTranscribeData } = require('./db');

async function test() {
    try {
        const data = await getTranscribeData(42); // Replace 123 with an actual fileId
        console.log(data);
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

test();
