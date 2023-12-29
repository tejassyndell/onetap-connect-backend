const fs = require('fs');

function replaceConsoleLogs(filePath) {
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return;
        }

        const replacedData = data.replace(/console\.log\(.*?\);?/g, '');

        fs.writeFile(filePath, replacedData, 'utf8', (err) => {
            if (err) {
                console.error(err);
                return;
            }
            console.log('Console logs replaced with empty strings in', filePath);
        });
    });
}

// Usage example: Replace console logs in a specific file
replaceConsoleLogs('../../paymentController/paymentcontroller.js');
