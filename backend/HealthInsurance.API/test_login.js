const fetch = require('node-fetch');

async function test() {
    try {
        const res = await fetch('http://localhost:5144/api/Auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'k@g', password: '123' })
        });
        const text = await res.text();
        console.log(`STATUS: ${res.status}`);
        console.log(`BODY: ${text.substring(0, 1000)}`);
    } catch (e) {
        console.log('Error hitting 5144, trying 7080...', e.message);
    }
}

test();
