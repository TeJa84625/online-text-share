const textInput = document.getElementById('textInput');
        const expiryCheck = document.getElementById('expiryCheck');
        const expiryFields = document.getElementById('expiryFields');
        const expiryDate = document.getElementById('expiryDate');
        const expiryTime = document.getElementById('expiryTime');
        const generateBtn = document.getElementById('generateBtn');
        const clearBtn = document.getElementById('clearBtn');
        const resultBox = document.getElementById('resultBox');
        const loadingBox = document.getElementById('loadingBox');
        const generateContainer = document.getElementById('generateContainer');
        const generateQrBtn = document.getElementById('generateQrBtn');
        const qrCodeSection = document.getElementById('qrCodeSection');
        const qrCodeContainer = document.getElementById('qrCodeContainer');
        const downloadQrBtn = document.getElementById('downloadQrBtn');
        const passwordCheck = document.getElementById('passwordCheck');
        const passwordFields = document.getElementById('passwordFields');
        const passwordInput = document.getElementById('password');
        const togglePassword = document.getElementById('togglePassword');
        const eyeIcon = document.getElementById('eyeIcon');
        const messageModal = document.getElementById('messageModal');
        const modalTitle = document.getElementById('modalTitle');
        const modalMessage = document.getElementById('modalMessage');
        const closeMessageModalBtn = document.getElementById('closeMessageModalBtn');

        function showMessageModal(title, message) {
            modalTitle.textContent = title;
            modalMessage.textContent = message;
            messageModal.classList.remove('hidden');
        }

        closeMessageModalBtn.addEventListener('click', () => {
            messageModal.classList.add('hidden');
        });

        textInput.addEventListener('input', () => {
        });
        expiryCheck.addEventListener('change', () => {
            if (expiryCheck.checked) {
                expiryFields.classList.remove('hidden');
            } else {
                expiryFields.classList.add('hidden');
            }
        });

        passwordCheck.addEventListener('change', () => {
            if (passwordCheck.checked) {
                passwordFields.classList.remove('hidden');
            } else {
                passwordFields.classList.add('hidden');
                passwordInput.value = '';
            }
        });

        togglePassword.addEventListener('click', () => {
            const isPassword = passwordInput.type === 'password';
            passwordInput.type = isPassword ? 'text' : 'password';
            eyeIcon.classList.toggle('fa-eye', isPassword);
            eyeIcon.classList.toggle('fa-eye-slash', !isPassword);
        });

        clearBtn.addEventListener('click', () => {
            textInput.value = '';
            resultBox.innerHTML = '';
            resultBox.classList.add('hidden');
            qrCodeSection.classList.add('hidden');
            generateContainer.innerHTML = '<button id="generateBtn" class="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition font-semibold shadow-lg">Generate Share Code</button>';
            document.getElementById('generateBtn').addEventListener('click', generateText);
        });

        function generateId() {
            return Math.floor(100000 + Math.random() * 900000).toString();
        }

        async function checkId(id) {
            const url = `https://script.google.com/macros/s/AKfycbxWaZqfnF7jMg56OKUcVRBtbfzLAl1BLkN1Bz8x0aABssrQUHWj7oxulTU3Y5lWMhex/exec?ID=${encodeURIComponent(id)}`;
            try {
                const resp = await fetch(url);
                if (!resp.ok) return false;
                const data = await resp.json();
                return data.status === 'not_found';
            } catch (e) {
                console.error('Error checking ID:', e);
                return false;
            }
        }

        function createCodeInputs(code) {
            const container = document.createElement('div');
            container.id = 'codeInputs';
            container.className = 'flex justify-center gap-3 w-full max-w-sm';

            for (const char of code) {
                const input = document.createElement('input');
                input.type = 'text';
                input.maxLength = 1;
                input.value = char;
                input.readOnly = true;
                input.className = 'code-box w-12 h-14 border border-gray-300 rounded-lg shadow transition text-center text-xl font-mono';
                container.appendChild(input);
            }
            return container;
        }

        function createResultButtons(code) {
            const container = document.createElement('div');
            container.className = 'flex items-center justify-center gap-3';

            const copyBtn = document.createElement('button');
            copyBtn.className = 'p-2 rounded bg-indigo-600 hover:bg-indigo-700 transition flex items-center justify-center';
            copyBtn.title = 'Copy code';
            copyBtn.setAttribute('aria-label', 'Copy code');
            copyBtn.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" 
                    stroke="currentColor" class="w-6 h-6 text-white">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M8 16h8M8 12h8m-6-8h6a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2" />
                </svg>`;
            copyBtn.addEventListener('click', () => {
                navigator.clipboard.writeText(code).then(() => {
                    showMessageModal('Success!', 'Code copied to clipboard!');
                }).catch(() => {
                    showMessageModal('Error!', 'Failed to copy code.');
                });
            });
            container.appendChild(copyBtn);

            const shareBtn = document.createElement('button');
            shareBtn.className = 'p-2 rounded bg-indigo-600 hover:bg-indigo-700 transition flex items-center justify-center';
            shareBtn.title = 'Share link';
            shareBtn.setAttribute('aria-label', 'Share link');
            shareBtn.innerHTML = `
                <span class="w-6 h-6 flex items-center justify-center">
                    <i class="fa-solid fa-share-nodes text-white text-lg"></i>
                </span>`;
            shareBtn.addEventListener('click', () => {
                const shareUrl = `${window.location.origin}/code.html?code=${encodeURIComponent(code)}`;
                if (navigator.share) {
                    navigator.share({
                        title: 'TextShare Code',
                        text: 'I shared some text with you! Use this code to view it:',
                        url: shareUrl,
                    }).then(() => {
                        console.log('Successful share');
                    }).catch((error) => {
                        console.log('Error sharing', error);
                    });
                } else {
                    navigator.clipboard.writeText(shareUrl).then(() => {
                        showMessageModal('Success!', 'Link copied to clipboard. You can share it manually.');
                    }).catch(() => {
                        showMessageModal('Error!', 'Failed to copy the link.');
                    });
                }
            });
            container.appendChild(shareBtn);

            return container;
        }

        function autoResize(textarea) {
            textarea.style.height = 'auto';
            textarea.style.height = textarea.scrollHeight + 'px';
        }

        async function generateText() {
            const text = textInput.value.trim();
            resultBox.innerHTML = '';
            resultBox.classList.add('hidden');

            if (!text) {
                showMessageModal('Warning!', 'Please enter some text to share.');
                return;
            }

            let expiryVal = '-';
            if (expiryCheck.checked) {
                if (!expiryDate.value || !expiryTime.value) {
                    showMessageModal('Error!', 'Please provide an expiry date and time.');
                    return;
                }
                const expiryDateTime = new Date(`${expiryDate.value}T${expiryTime.value}`);
                const now = new Date();

                if (expiryDateTime <= now) {
                    showMessageModal('Error!', 'Please select an expiry date and time in the future.');
                    return;
                }

                const dd = String(expiryDateTime.getDate()).padStart(2, '0');
                const mm = String(expiryDateTime.getMonth() + 1).padStart(2, '0');
                const yyyy = expiryDateTime.getFullYear();
                const hh = String(expiryDateTime.getHours()).padStart(2, '0');
                const min = String(expiryDateTime.getMinutes()).padStart(2, '0');
                expiryVal = `${dd}-${mm}-${yyyy}-${hh}-${min}`;
            }

            let securityVal = '-';
            if (passwordCheck.checked) {
                securityVal = passwordInput.value;
                if (!securityVal) {
                    showMessageModal('Warning!', 'Please enter a password.');
                    return;
                }
                if (!/[a-zA-Z]/.test(securityVal)) {
                    showMessageModal('Warning!', 'Password must contain at least one character.');
                    return;
                }
            }

            generateBtn.disabled = true;
            generateBtn.textContent = "Generating...";
            qrCodeSection.classList.add('hidden');
            loadingBox.classList.remove('hidden');

            let code = '';
            for (let i = 0; i < 5; i++) {
                const candidate = generateId();
                if (await checkId(candidate)) {
                    code = candidate;
                    break;
                }
            }

            if (!code) {
                loadingBox.classList.add('hidden');
                showMessageModal('Error!', 'Unable to generate a unique code. Please try again.');
                generateBtn.textContent = "Generate Share Code";
                generateBtn.disabled = false;
                return;
            }

            const formUrl = 'https://docs.google.com/forms/d/e/1FAIpQLSdHUZHIdCRqnpjFN3s0GPdNsU2YT_3xXvG-ERL2oYOnnEA_YA/formResponse';
            const formData = new FormData();
            formData.append('entry.69522754', code);
            formData.append('entry.659475936', 'Text');
            formData.append('entry.1160567664', text);
            formData.append('entry.1316125311', securityVal);
            formData.append('entry.2035113390', expiryVal);

            try {
                await fetch(formUrl, {
                    method: 'POST',
                    mode: 'no-cors',
                    body: formData
                });

                generateContainer.innerHTML = '';
                loadingBox.classList.add('hidden');

                resultBox.classList.remove('hidden');
                const codeInputs = createCodeInputs(code);
                const resultBtnsContainer = createResultButtons(code);

                resultBox.appendChild(codeInputs);
                resultBox.appendChild(resultBtnsContainer);

                qrCodeSection.classList.remove('hidden');

                const oldGenerateQrBtn = document.getElementById('generateQrBtn');
                if (oldGenerateQrBtn) {
                    oldGenerateQrBtn.parentNode.removeChild(oldGenerateQrBtn);
                }
                const newGenerateQrBtn = document.createElement('button');
                newGenerateQrBtn.id = 'generateQrBtn';
                newGenerateQrBtn.className = 'bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition font-semibold shadow-lg';
                newGenerateQrBtn.textContent = 'Generate QR Code';
                qrCodeSection.prepend(newGenerateQrBtn);

                qrCodeContainer.innerHTML = '';
                downloadQrBtn.classList.add('hidden');

                newGenerateQrBtn.addEventListener('click', () => generateQrCode(code));

            } catch (err) {
                loadingBox.classList.add('hidden');
                showMessageModal('Error!', 'Something went wrong. Please try again.');
                generateBtn.textContent = "Generate Share Code";
                generateBtn.disabled = false;
            }
        }

        document.getElementById('generateBtn').addEventListener('click', generateText);

        function generateQrCode(code) {
            const oldQrBtn = document.getElementById('generateQrBtn');
            if (oldQrBtn) {
                oldQrBtn.textContent = "Generating...";
                oldQrBtn.disabled = true;
            }

            const currentUrl = window.location.href;
            const baseUrl = currentUrl.substring(0, currentUrl.lastIndexOf('/') + 1);
            const url = `${baseUrl}code.html?code=${encodeURIComponent(code)}`;

            qrCodeContainer.innerHTML = '';

            const qrCode = new QRCode(qrCodeContainer, {
                text: url,
                width: 128,
                height: 128,
                colorDark: "#000000",
                colorLight: "#ffffff",
                correctLevel: QRCode.CorrectLevel.L
            });

            if (oldQrBtn) {
                oldQrBtn.remove();
            }
            downloadQrBtn.classList.remove('hidden');

            downloadQrBtn.addEventListener('click', () => {
                const canvas = qrCodeContainer.querySelector('canvas');
                const qrImage = canvas.toDataURL('image/png');
                const link = document.createElement('a');
                link.href = qrImage;
                link.download = `textshare_code_${code}.png`;
                link.click();
            });
        }

        window.addEventListener('DOMContentLoaded', () => {
            const today = new Date();
            const todayDateString = today.toISOString().split('T')[0];
            document.getElementById('expiryDate').setAttribute('min', todayDateString);

            document.getElementById('closePopup').addEventListener('click', () => {
                document.getElementById('pagePopup').classList.add('hidden');
            });
            document.getElementById('closePopupBtn').addEventListener('click', () => {
                document.getElementById('pagePopup').classList.add('hidden');
            });
        });

        document.addEventListener('keydown', function (e) {
            if (e.key === "F12" || (e.ctrlKey && e.shiftKey && e.key === "I")) {
                e.preventDefault();
            }
        });

        document.addEventListener('contextmenu', function (e) {
            e.preventDefault();
        });