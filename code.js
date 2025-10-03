const inputs = document.querySelectorAll('.code-box');
const resultDiv = document.getElementById('result');
const resultMobile = document.getElementById('resultMobile');
const clearBtn = document.getElementById('clearBtn');
const clearBtnWrapper = document.getElementById('clearBtnWrapper');
const actionButtons = document.getElementById('actionButtons');
const copyBtn = document.getElementById('copyBtn');
const downloadBtn = document.getElementById('downloadBtn');

const passwordModal = document.getElementById('passwordModal');
const passwordInput = document.getElementById('passwordInput');
const passwordError = document.getElementById('passwordError');
const togglePassword = document.getElementById('togglePassword');
const cancelPasswordBtn = document.getElementById('cancelPassword');
const submitPasswordBtn = document.getElementById('submitPassword');

const BASE_URL = 'https://script.google.com/macros/s/AKfycbyP-hulbsaImJGfl4qfMu8aaXKst8Gbw2GufxwozvYi_sMnadqSNVNbngcMAVzT_rCmng/exec';

function clearInputs() {
    inputs.forEach(input => input.value = '');
    if (inputs[0]) inputs[0].focus();
    clearBtnWrapper.classList.add('hidden');
    resultDiv.innerHTML = '<p class="text-gray-400">Enter a 6-digit code to view the shared content here.</p>';
    actionButtons.classList.add('hidden');
}

clearBtn.addEventListener('click', () => {
    clearInputs();
});

inputs.forEach((input, idx) => {
    input.addEventListener('input', (e) => {
        const val = e.target.value;
        if (/^\d$/.test(val)) {
            if (idx < inputs.length - 1) inputs[idx + 1].focus();
        } else {
            e.target.value = '';
        }

        const digitsEntered = [...inputs].filter(i => i.value !== '').length;
        if (digitsEntered > 0) {
            clearBtnWrapper.classList.remove('hidden');
        } else {
            clearBtnWrapper.classList.add('hidden');
        }

        const code = [...inputs].map(i => i.value).join('');
        if (code.length === 6) {
            fetchCodeData(code);
            document.activeElement.blur();
        }
    });

    input.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace' && !input.value && idx > 0) {
            inputs[idx - 1].focus();
        }
    });

    input.addEventListener('paste', (e) => {
        e.preventDefault();
        const paste = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        if (paste.length) {
            paste.split('').forEach((char, i) => {
                if (inputs[i]) inputs[i].value = char;
            });
            if (paste.length > 0) {
                clearBtnWrapper.classList.remove('hidden');
            }
            if (paste.length === 6) {
                fetchCodeData(paste);
                document.activeElement.blur();
            }
        }
    });
});

/**
 * Fetches the initial data for the given 6-digit code.
 * @param {string} code The 6-digit code.
 */
async function fetchCodeData(code) {
    resultDiv.innerHTML = '<p class="text-gray-500">Checking...</p>';
    actionButtons.classList.add('hidden');
    const url = `${BASE_URL}?ID=${code}`;
    
    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error('Network response was not ok');
        const data = await res.json();
        
        displayData(data, code);
    } catch (err) {
        resultDiv.innerHTML = '<p class="text-red-600">Error fetching data. Try again.</p>';
        console.error('Fetch error:', err);
    }
}

/**
 * Handles the different API responses after the initial code check.
 * @param {object} data The JSON response object.
 * @param {string} code The 6-digit code.
 */
function displayData(data, code) {
    actionButtons.classList.add('hidden');
    
    if (data.status === 'expired') {
        resultDiv.innerHTML = '<p class="text-red-600 font-semibold">‼️ This code has expired.</p>';
    } else if (data.status === 'not_found') {
        resultDiv.innerHTML = '<p class="text-red-600">❌ Invalid code or no data found.</p>';
    } else if (data.status === 'found' && data.Security === 'yes') {
        showPasswordModal(code);
    } else if (data.Data) { 
        renderContent(data.Data, code);
    } else {
        resultDiv.innerHTML = '<p class="text-red-600">Unexpected response from server.</p>';
    }
}

/**
 * Fetches the content using the code and password.
 * @param {string} code The 6-digit code.
 * @param {string} password The entered password.
 */
async function fetchSecureData(code, password) {
    resultDiv.innerHTML = '<p class="text-gray-500">Verifying password...</p>';
    const url = `${BASE_URL}?ID=${code}&password=${encodeURIComponent(password)}`;
    
    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error('Network response was not ok');
        const data = await res.json();
        
        if (data.status === 'wrong_password') {
            passwordError.classList.remove('hidden');
            passwordInput.value = '';
            passwordInput.focus();
            resultDiv.innerHTML = '<p class="text-gray-400">Please enter the password to view the content.</p>';
            passwordModal.classList.add('hidden');
            renderContent(data.Data, code);
        } else {
            passwordModal.classList.add('hidden');
            resultDiv.innerHTML = '<p class="text-red-600">Error: Could not retrieve secure data.</p>';
            console.error('Secure fetch unexpected data:', data);
        }
    } catch (err) {
        passwordModal.classList.add('hidden');
        resultDiv.innerHTML = '<p class="text-red-600">Error fetching secure data. Try again.</p>';
        console.error('Secure fetch error:', err);
    }
}

function renderContent(content, code) {
    const preContent = `<pre class="bg-white p-4 rounded border border-gray-300 shadow-inner w-full">${content}</pre>`;
    resultDiv.innerHTML = preContent;

    actionButtons.classList.remove('hidden');

    copyBtn.onclick = () => copyToClipboard(content);
    downloadBtn.onclick = () => downloadAsTextFile(content, code);
}

/**
 * Displays the password modal and sets up event listeners for submission.
 * @param {string} code The 6-digit code.
 */
function showPasswordModal(code) {
    passwordModal.classList.remove('hidden');
    passwordInput.value = '';
    passwordError.classList.add('hidden');
    passwordInput.focus();
    
    resultDiv.innerHTML = '<p class="text-gray-400">Please enter the password to view the content.</p>';

    submitPasswordBtn.onclick = null;
    passwordInput.onkeydown = null;
    cancelPasswordBtn.onclick = null;

    const onSubmit = () => {
        const enteredPassword = passwordInput.value;
        if (enteredPassword) {
            fetchSecureData(code, enteredPassword);
        } else {
            passwordError.classList.remove('hidden');
            passwordInput.focus();
        }
    };

    submitPasswordBtn.onclick = onSubmit;

    passwordInput.onkeydown = (e) => {
        if (e.key === 'Enter') {
            onSubmit();
        }
    };

    cancelPasswordBtn.onclick = () => {
        passwordModal.classList.add('hidden');
        clearInputs();
    };

    togglePassword.onclick = () => {
        const type = passwordInput.type === 'password' ? 'text' : 'password';
        passwordInput.type = type;
        const icon = togglePassword.querySelector('i');
        icon.classList.toggle('fa-eye');
        icon.classList.toggle('fa-eye-slash');
    };
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        alert('Text copied to clipboard!');
    }).catch(err => {
        console.error('Error copying text: ', err);
    });
}

function downloadAsTextFile(text, code) {
    const blob = new Blob([text], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `shared_text_${code}.txt`;
    link.click();
    URL.revokeObjectURL(link.href);
}

window.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const codeFromUrl = urlParams.get('code');

    if (codeFromUrl && codeFromUrl.length === 6 && /^\d+$/.test(codeFromUrl)) {
        codeFromUrl.split('').forEach((digit, i) => {
            if (inputs[i]) inputs[i].value = digit;
        });

        fetchCodeData(codeFromUrl);
    } else {
        if (inputs[0]) inputs[0].focus();
    }
});

document.addEventListener('keydown', function (e) {
    if (e.key === "F12" || (e.ctrlKey && e.shiftKey && e.key === "I")) {
        e.preventDefault();
    }
});

document.addEventListener('contextmenu', function (e) {
    e.preventDefault();
});