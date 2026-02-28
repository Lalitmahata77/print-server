// const express = require('express');
// const escpos = require('escpos');
// escpos.Network = require('escpos-network');

// const app = express();
// app.use(express.json());

// const PORT = 3000;
// const PRINTER_IPS = ['192.168.1.100', '192.168.1.95'];

// // Function to handle the thermal printing logic
// const printToThermal = (ip, text) => {
//     return new Promise((resolve, reject) => {
//         const device = new escpos.Network(ip, 9100);
//         const printer = new escpos.Printer(device);

//         device.open((err) => {
//             if (err) return reject(`Connection failed for ${ip}`);

//             printer
//                 .font('a')
//                 .align('ct')
//                 .size(1, 1)
//                 .text(text) // Your dynamic text here
//                 .feed(3)
//                 .cut()
//                 .close(() => resolve(`Printed on ${ip}`));
//         });
//     });
// };

// // 4. Define the Print Route
// app.post('/print', async (req, res) => {
//     const { message } = req.body; // Expecting { "message": "Order #123" }

//     try {
//         // Send to all printers at the same time
//         const results = await Promise.all(PRINTER_IPS.map(ip => printToThermal(ip, message)));
//         res.status(200).json({ success: true, details: results });
//     } catch (error) {
//         res.status(500).json({ success: false, error: error.toString() });
//     }
// });

// app.listen(PORT, () => {
//     console.log(`Server running at http://localhost:${PORT}`);
// });







const express = require('express');
const escpos = require('escpos');
escpos.Network = require('escpos-network');

const app = express();
app.use(express.json());

const PORT = 3000;

const printToThermal = (ip, text) => {
    return new Promise((resolve, reject) => {
        // We set a timeout so one offline printer doesn't hang the whole request
        const device = new escpos.Network('printer.lokendrachaulagain.com.np', 9100); 
        const printer = new escpos.Printer(device);
``
        device.open((err) => {
            if (err) return reject(`Connection failed for ${ip}`);

            printer
                .font('a')
                .align('ct')
                .size(1, 1)
                .text(text)
                .feed(3)
                .cut()
                .close(() => resolve(`Printed on ${ip}`));
        });
    });
};

// Updated Route to accept IPs from client
app.post('/print', async (req, res) => {
    const { message, ips } = req.body; 

    if (!ips || !Array.isArray(ips) || ips.length === 0) {
        return res.status(400).json({ success: false, error: "Please provide an array of printer IPs." });
    }

    try {
        // This maps through the IPs provided by the client (Postman/Frontend)
        const results = await Promise.all(ips.map(ip => printToThermal(ip, message)));
        res.status(200).json({ success: true, details: results });
    } catch (error) {
        res.status(500).json({ success: false, error: error.toString() });
    }
});

app.get('/', (req, res) => {
    res.send('Thermal Printer API is running! Use /print to send jobs.');
});


module.exports = app; 

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
