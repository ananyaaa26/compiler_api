
const codeEditor = document.getElementById('codeEditor');
const output = document.getElementById('output');
const compileBtn = document.getElementById('compileBtn');
const languageSelect = document.getElementById('languageSelect');

compileBtn.addEventListener('click', async () => {
    const code = codeEditor.value;
    const langId = languageSelect.value;

    if (!code.trim()) {
        output.textContent = 'ERROR: Please enter some code';
        return;
    }

    compileBtn.disabled = true;
    output.textContent = 'Compiling...';

    try {
        // Submit code
        const response = await fetch('https://codequotient.com/api/executeCode', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ code, langId })
        });

        const data = await response.json();

        if (data.error) {
            output.textContent = `ERROR: ${data.error}`;
            compileBtn.disabled = false;
            return;
        }

        // Poll for results
        const codeId = data.codeId;
        let intervalId = setInterval(async () => {
            try {
                const resultResponse = await fetch(`https://codequotient.com/api/codeResult/${codeId}`);
                const resultData = await resultResponse.json();

                if (resultData.data && Object.keys(resultData.data).length > 0) {
                    clearInterval(intervalId);
                    compileBtn.disabled = false;

                    const { output: programOutput, errors } = resultData.data;
                    
                    if (errors) {
                        output.textContent = `ERROR:\n${errors}`;
                    } else {
                        output.textContent = programOutput || 'No output';
                    }
                }
            } catch (error) {
                clearInterval(intervalId);
                compileBtn.disabled = false;
                output.textContent = `Error fetching results: ${error.message}`;
            }
        }, 1000);

        // Clear interval after 30 seconds to prevent infinite polling
        setTimeout(() => {
            if (intervalId) {
                clearInterval(intervalId);
                compileBtn.disabled = false;
                output.textContent = 'Execution timed out';
            }
        }, 30000);

    } catch (error) {
        compileBtn.disabled = false;
        output.textContent = `Error: ${error.message}`;
    }
});