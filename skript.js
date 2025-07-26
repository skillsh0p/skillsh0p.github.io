// Создание плавающих монеток
function createFloatingCoins() {
    const container = document.getElementById('floatingCoins');
    const coinsCount = 15;
    
    for (let i = 0; i < coinsCount; i++) {
        const coin = document.createElement('div');
        coin.className = 'coin';
        
        const size = Math.random() * 10 + 10;
        const left = Math.random() * 100;
        const animationDuration = Math.random() * 10 + 10;
        const delay = Math.random() * 15;
        
        coin.style.width = `${size}px`;
        coin.style.height = `${size}px`;
        coin.style.left = `${left}%`;
        coin.style.animationDuration = `${animationDuration}s`;
        coin.style.animationDelay = `${delay}s`;
        
        container.appendChild(coin);
    }
}

// Данные для донат-кейса
const CASE_ITEMS = [
    { name: 'Основатель', weight: 0.0001, color: '#FF0000' },
    { name: 'Бог', weight: 0.001, color: '#FF6600' },
    { name: 'Анти гриф', weight: 0.005, color: '#FFCC00' },
    { name: 'Оператор', weight: 0.01, color: '#33CC33' },
    { name: 'Админ', weight: 0.05, color: '#3399FF' },
    { name: 'Модер', weight: 0.1, color: '#9966FF' },
    { name: 'Креат', weight: 0.15, color: '#FF66CC' },
    { name: 'Прем', weight: 0.2, color: '#FF5050' },
    { name: 'Флай', weight: 0.3, color: '#FF9933' },
    { name: '1.000.000 монет', weight: 0.05, color: '#66FF66' },
    { name: '500.000 монет', weight: 0.1, color: '#66FFFF' },
    { name: '200.000 монет', weight: 0.15, color: '#6699FF' },
    { name: '60.000 монет', weight: 0.2, color: '#CC66FF' },
    { name: '20.000 монет', weight: 0.3, color: '#FFFF66' }
];

// Инициализация донат-кейса
function initCase() {
    const caseWheel = document.getElementById('caseWheel');
    caseWheel.innerHTML = '<div class="case-pointer"></div>';
    
    const segmentAngle = 360 / CASE_ITEMS.length;
    
    CASE_ITEMS.forEach((item, index) => {
        const segment = document.createElement('div');
        segment.className = 'case-item';
        segment.textContent = item.name;
        segment.style.transform = `rotate(${index * segmentAngle}deg)`;
        segment.style.color = getContrastColor(item.color);
        segment.style.backgroundColor = item.color;
        caseWheel.appendChild(segment);
    });
}

// Получение контрастного цвета текста
function getContrastColor(hexColor) {
    const r = parseInt(hexColor.substr(1, 2), 16);
    const g = parseInt(hexColor.substr(3, 2), 16);
    const b = parseInt(hexColor.substr(5, 2), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128 ? '#000000' : '#ffffff';
}

// Текущая выбранная покупка
let currentPurchase = null;
let currentAdmin = null;
let requests = {
    donations: [],
    cases: []
};

// Получаем все необходимые элементы DOM
const modal = document.getElementById('purchaseModal');
const modalTitle = document.getElementById('modalTitle');
const nicknameInput = document.getElementById('nickname');
const contactInput = document.getElementById('contact');
const confirmBtn = document.getElementById('confirmPurchase');
const cancelBtn = document.getElementById('cancelPurchase');
const statusMessage = document.getElementById('statusMessage');
const contactOwner = document.getElementById('contactOwner');
const nicknameError = document.getElementById('nicknameError');
const contactError = document.getElementById('contactError');

const caseModal = document.getElementById('caseModal');
const caseNicknameInput = document.getElementById('caseNickname');
const caseContactInput = document.getElementById('caseContact');
const confirmCaseBtn = document.getElementById('confirmCase');
const cancelCaseBtn = document.getElementById('cancelCase');
const caseStatusMessage = document.getElementById('caseStatusMessage');
const caseContactOwner = document.getElementById('caseContactOwner');
const caseNicknameError = document.getElementById('caseNicknameError');
const caseContactError = document.getElementById('caseContactError');

const adminLoginModal = document.getElementById('adminLoginModal');
const adminUsernameInput = document.getElementById('adminUsername');
const adminPasswordInput = document.getElementById('adminPassword');
const adminLoginBtn = document.getElementById('adminLoginBtn');
const adminCancelBtn = document.getElementById('adminCancelBtn');
const adminLoginStatus = document.getElementById('adminLoginStatus');
const adminUsernameError = document.getElementById('adminUsernameError');
const adminPasswordError = document.getElementById('adminPasswordError');

const caseWheel = document.getElementById('caseWheel');
const spinBtn = document.getElementById('spinBtn');
const caseResult = document.getElementById('caseResult');

const adminLoginSection = document.getElementById('adminLoginSection');
const adminPanel = document.getElementById('adminPanel');
const adminLoginButton = document.getElementById('adminLoginButton');
const adminLogoutButton = document.getElementById('adminLogoutButton');
const adminUsernameDisplay = document.getElementById('adminUsernameDisplay');
const donationRequestsList = document.getElementById('donationRequests');
const caseRequestsList = document.getElementById('caseRequests');
const totalRequestsElement = document.getElementById('totalRequests');
const pendingRequestsElement = document.getElementById('pendingRequests');
const approvedRequestsElement = document.getElementById('approvedRequests');
const rejectedRequestsElement = document.getElementById('rejectedRequests');

const navTabs = document.querySelectorAll('.nav-tab');
const tabContents = document.querySelectorAll('.tab-content');

// Валидация ника (только английские буквы и цифры)
function validateNickname(nickname) {
    return /^[A-Za-z0-9]+$/.test(nickname);
}

// Валидация Telegram контакта (начинается с @)
function validateTelegramContact(contact) {
    return contact.startsWith('@') && contact.length > 1;
}

// Показать статусное сообщение
function showStatus(element, text, type) {
    element.textContent = text;
    element.className = `status-message status-${type}`;
    element.style.display = 'block';
}

// Отправка сообщения через Telegram Bot API с обработкой CORS
async function sendTelegramMessage(chatId, text) {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: chatId,
                text: text,
                parse_mode: 'Markdown'
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.description || `HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Ошибка при отправке сообщения:', error);
        saveFailedRequest(chatId, text);
        throw error;
    }
}

// Сохранение неудачных запросов
function saveFailedRequest(chatId, text) {
    const failedRequests = JSON.parse(localStorage.getItem('failed_requests') || '[]');
    const updatedRequests = [...JSON.parse(failedRequests), { 
        chatId, 
        text, 
        timestamp: new Date().toISOString() 
    }];
    localStorage.setItem('failed_requests', JSON.stringify(updatedRequests));
}

// Попытка отправить сохраненные запросы
async function retryFailedRequests() {
    const failedRequests = JSON.parse(localStorage.getItem('failed_requests') || '[]');
    if (failedRequests.length === 0) return;
    
    const successfulRequests = [];
    
    for (const request of JSON.parse(failedRequests)) {
        try {
            await sendTelegramMessage(request.chatId, request.text);
            successfulRequests.push(request);
        } catch (error) {
            console.error(`Не удалось отправить сохраненный запрос: ${error}`);
        }
    }
    
    // Удаляем успешно отправленные запросы
    if (successfulRequests.length > 0) {
        const remainingRequests = JSON.parse(failedRequests).filter(req => 
            !successfulRequests.some(succReq => 
                succReq.timestamp === req.timestamp
            )
        );
        localStorage.setItem('failed_requests', JSON.stringify(remainingRequests));
    }
}

// Вращение донат-кейса
function spinCase() {
    if (spinBtn.disabled) return;
    
    spinBtn.disabled = true;
    caseResult.style.display = 'none';
    
    // Выбираем случайный приз с учетом весов
    const totalWeight = CASE_ITEMS.reduce((sum, item) => sum + item.weight, 0);
    let random = Math.random() * totalWeight;
    let selectedItem = null;
    
    for (const item of CASE_ITEMS) {
        if (random < item.weight) {
            selectedItem = item;
            break;
        }
        random -= item.weight;
    }
    
    if (!selectedItem) selectedItem = CASE_ITEMS[0];
    
    // Анимация вращения
    const spinDuration = 3000 + Math.random() * 2000;
    const rotations = 5 + Math.random() * 3;
    const segmentAngle = 360 / CASE_ITEMS.length;
    const selectedIndex = CASE_ITEMS.findIndex(item => item === selectedItem);
    const targetAngle = 360 * rotations + (selectedIndex * segmentAngle) + (segmentAngle / 2);
    
    caseWheel.style.transition = `transform ${spinDuration}ms cubic-bezier(0.17, 0.67, 0.21, 0.99)`;
    caseWheel.style.transform = `rotate(-${targetAngle}deg)`;
    
    setTimeout(() => {
        caseResult.textContent = `Вы выиграли: ${selectedItem.name}`;
        caseResult.className = 'case-result win';
        caseResult.style.display = 'block';
        
        sendCaseResult(selectedItem);
        
        spinBtn.disabled = true;
        spinBtn.textContent = 'Ожидайте подтверждения';
    }, spinDuration);
}

// Отправка результата донат-кейса админам
async function sendCaseResult(item) {
    const nickname = caseNicknameInput.value.trim();
    const contact = caseContactInput.value.trim();
    
    try {
        const message = `🎁 *Результат донат-кейса:*\n\n` +
                       `🏆 *Выигрыш:* ${item.name}\n` +
                       `👤 *Ник:* ${nickname}\n` +
                       `📞 *Контакт:* ${contact}\n\n` +
                       `⏱️ ${new Date().toLocaleString()}\n` +
                       `🔗 [Ссылка](${window.location.href})`;
        
        const sendPromises = OWNER_IDS.map(ownerId => sendTelegramMessage(ownerId, message));
        await Promise.all(sendPromises);
        
        const request = {
            id: Date.now(),
            nickname: nickname,
            contact: contact,
            prize: `${item.name}`,
            status: 'pending',
            date: new Date().toLocaleString()
        };
        
        requests.cases.push(request);
        saveRequests();
        updateAdminPanel();
        
    } catch (error) {
        console.error('Ошибка при отправке результата донат-кейса:', error);
        showStatus(caseStatusMessage, '❌ Произошла ошибка при отправке заявки. Пожалуйста, попробуйте позже или свяжитесь с владельцем напрямую.', 'error');
        caseContactOwner.style.display = 'block';
    }
}

// Сохранение запросов в localStorage
function saveRequests() {
    localStorage.setItem('skillshop_requests', JSON.stringify(requests));
}

// Загрузка запросов из localStorage
function loadRequests() {
    const savedRequests = localStorage.getItem('skillshop_requests');
    if (savedRequests) {
        requests = JSON.parse(savedRequests);
    }
}

// Обновление админ панели
function updateAdminPanel() {
    if (!currentAdmin) return;
    
    const totalDonationRequests = requests.donations.length;
    const pendingDonationRequests = requests.donations.filter(r => r.status === 'pending').length;
    const approvedDonationRequests = requests.donations.filter(r => r.status === 'approved').length;
    const rejectedDonationRequests = requests.donations.filter(r => r.status === 'rejected').length;
    
    const totalCaseRequests = requests.cases.length;
    const pendingCaseRequests = requests.cases.filter(r => r.status === 'pending').length;
    const approvedCaseRequests = requests.cases.filter(r => r.status === 'approved').length;
    const rejectedCaseRequests = requests.cases.filter(r => r.status === 'rejected').length;
    
    totalRequestsElement.textContent = totalDonationRequests + totalCaseRequests;
    pendingRequestsElement.textContent = pendingDonationRequests + pendingCaseRequests;
    approvedRequestsElement.textContent = approvedDonationRequests + approvedCaseRequests;
    rejectedRequestsElement.textContent = rejectedDonationRequests + rejectedCaseRequests;
    
    donationRequestsList.innerHTML = '';
    requests.donations.forEach(request => {
        const requestElement = document.createElement('div');
        requestElement.className = `request-item ${request.status !== 'pending' ? 'completed' : ''}`;
        
        requestElement.innerHTML = `
            <div class="request-info">
                <p><strong>Привилегия:</strong> ${request.item} (${request.price})</p>
                <p><strong>Ник:</strong> ${request.nickname}</p>
                <p><strong>Контакт:</strong> ${request.contact}</p>
                <p><strong>Дата:</strong> ${request.date}</p>
                <p><strong>Статус:</strong> ${getStatusText(request.status)}</p>
            </div>
            <div class="request-actions">
                ${request.status === 'pending' ? `
                    <button class="request-btn approve" data-id="${request.id}" data-type="donation">Подтвердить</button>
                    <button class="request-btn reject" data-id="${request.id}" data-type="donation">Отклонить</button>
                ` : `
                    <button class="request-btn completed">${getStatusText(request.status)}</button>
                `}
            </div>
        `;
        
        donationRequestsList.appendChild(requestElement);
    });
    
    caseRequestsList.innerHTML = '';
    requests.cases.forEach(request => {
        const requestElement = document.createElement('div');
        requestElement.className = `request-item ${request.status !== 'pending' ? 'completed' : ''}`;
        
        requestElement.innerHTML = `
            <div class="request-info">
                <p><strong>Выигрыш:</strong> ${request.prize}</p>
                <p><strong>Ник:</strong> ${request.nickname}</p>
                <p><strong>Контакт:</strong> ${request.contact}</p>
                <p><strong>Дата:</strong> ${request.date}</p>
                <p><strong>Статус:</strong> ${getStatusText(request.status)}</p>
            </div>
            <div class="request-actions">
                ${request.status === 'pending' ? `
                    <button class="request-btn approve" data-id="${request.id}" data-type="case">Подтвердить</button>
                    <button class="request-btn reject" data-id="${request.id}" data-type="case">Отклонить</button>
                ` : `
                    <button class="request-btn completed">${getStatusText(request.status)}</button>
                `}
            </div>
        `;
        
        caseRequestsList.appendChild(requestElement);
    });
    
    document.querySelectorAll('.request-btn.approve').forEach(btn => {
        btn.addEventListener('click', () => approveRequest(
            parseInt(btn.dataset.id),
            btn.dataset.type
        ));
    });
    
    document.querySelectorAll('.request-btn.reject').forEach(btn => {
        btn.addEventListener('click', () => rejectRequest(
            parseInt(btn.dataset.id),
            btn.dataset.type
        ));
    });
}

function getStatusText(status) {
    switch (status) {
        case 'pending': return 'Ожидает';
        case 'approved': return 'Подтверждено';
        case 'rejected': return 'Отклонено';
        default: return status;
    }
}

function approveRequest(id, type) {
    const requestType = type === 'donation' ? 'donations' : 'cases';
    
    const requestIndex = requests[requestType].findIndex(r => r.id === id);
    if (requestIndex !== -1) {
        requests[requestType][requestIndex].status = 'approved';
        saveRequests();
        updateAdminPanel();
        
        if (type === 'case') {
            spinBtn.disabled = false;
            spinBtn.textContent = 'Открыть за 200к';
        }
    }
}

function rejectRequest(id, type) {
    const requestType = type === 'donation' ? 'donations' : 'cases';
    
    const requestIndex = requests[requestType].findIndex(r => r.id === id);
    if (requestIndex !== -1) {
        requests[requestType][requestIndex].status = 'rejected';
        saveRequests();
        updateAdminPanel();
    }
}

// Переключение вкладок
navTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        navTabs.forEach(t => t.classList.remove('active'));
        tabContents.forEach(c => c.classList.remove('active'));
        
        tab.classList.add('active');
        document.getElementById(`${tab.dataset.tab}-tab`).classList.add('active');
    });
});

// Обработчики событий для покупки доната
document.querySelectorAll('.buy-btn').forEach(btn => {
    if (btn.id) return;
    
    btn.addEventListener('click', (e) => {
        currentPurchase = {
            item: btn.dataset.item,
            price: btn.dataset.price
        };
        
        modalTitle.textContent = `Покупка: ${currentPurchase.item} (${currentPurchase.price})`;
        nicknameInput.value = '';
        contactInput.value = '';
        statusMessage.style.display = 'none';
        contactOwner.style.display = 'none';
        nicknameError.style.display = 'none';
        contactError.style.display = 'none';
        nicknameInput.classList.remove('input-error');
        contactInput.classList.remove('input-error');
        
        modal.style.display = 'flex';
    });
});

// Обработчики событий для донат-кейса
spinBtn.addEventListener('click', () => {
    caseNicknameInput.value = '';
    caseContactInput.value = '';
    caseStatusMessage.style.display = 'none';
    caseContactOwner.style.display = 'none';
    caseNicknameError.style.display = 'none';
    caseContactError.style.display = 'none';
    caseNicknameInput.classList.remove('input-error');
    caseContactInput.classList.remove('input-error');
    
    caseModal.style.display = 'flex';
});

confirmCaseBtn.addEventListener('click', async () => {
    const nickname = caseNicknameInput.value.trim();
    const contact = caseContactInput.value.trim();
    
    // Сброс ошибок
    caseNicknameInput.classList.remove('input-error');
    caseContactInput.classList.remove('input-error');
    caseNicknameError.style.display = 'none';
    caseContactError.style.display = 'none';
    
    // Валидация
    let isValid = true;
    
    if (!nickname) {
        caseNicknameInput.classList.add('input-error');
        caseNicknameError.textContent = 'Пожалуйста, введите ваш ник';
        caseNicknameError.style.display = 'block';
        isValid = false;
    } else if (!validateNickname(nickname)) {
        caseNicknameInput.classList.add('input-error');
        caseNicknameError.textContent = 'Ник должен содержать только английские буквы и цифры';
        caseNicknameError.style.display = 'block';
        isValid = false;
    }
    
    if (!contact) {
        caseContactInput.classList.add('input-error');
        caseContactError.textContent = 'Пожалуйста, укажите контакт для связи';
        caseContactError.style.display = 'block';
        isValid = false;
    } else if (!validateTelegramContact(contact)) {
        caseContactInput.classList.add('input-error');
        caseContactError.textContent = 'Контакт должен начинаться с @ и содержать имя пользователя';
        caseContactError.style.display = 'block';
        isValid = false;
    }
    
    if (!isValid) return;
    
    confirmCaseBtn.disabled = true;
    confirmCaseBtn.textContent = 'Отправка...';
    
    try {
        const message = `🎰 *Новая заявка на открытие донат-кейса:*\n\n` +
                       `👤 *Ник:* ${nickname}\n` +
                       `📞 *Контакт:* ${contact}\n` +
                       `💰 *Стоимость:* 200к\n\n` +
                       `⏱️ ${new Date().toLocaleString()}\n` +
                       `🔗 [Ссылка](${window.location.href})`;
        
        const sendPromises = OWNER_IDS.map(ownerId => sendTelegramMessage(ownerId, message));
        await Promise.all(sendPromises);
        
        const request = {
            id: Date.now(),
            nickname: nickname,
            contact: contact,
            prize: 'Донат-кейс (ожидание)',
            status: 'pending',
            date: new Date().toLocaleString()
        };
        
        requests.cases.push(request);
        saveRequests();
        updateAdminPanel();
        
        showStatus(caseStatusMessage, '✅ Ваша заявка успешно отправлена! Ожидайте подтверждения администратора.', 'success');
        caseContactOwner.style.display = 'block';
        
        setTimeout(() => {
            caseModal.style.display = 'none';
            spinCase();
        }, 2000);
        
    } catch (error) {
        console.error('Ошибка при отправке заявки:', error);
        showStatus(caseStatusMessage, '❌ Произошла ошибка при отправке заявки. Пожалуйста, попробуйте позже или свяжитесь с владельцем напрямую.', 'error');
        caseContactOwner.style.display = 'block';
    } finally {
        confirmCaseBtn.disabled = false;
        confirmCaseBtn.textContent = 'Подтвердить';
    }
});

cancelCaseBtn.addEventListener('click', () => {
    caseModal.style.display = 'none';
});

confirmBtn.addEventListener('click', async () => {
    const nickname = nicknameInput.value.trim();
    const contact = contactInput.value.trim();
    
    // Сброс ошибок
    nicknameInput.classList.remove('input-error');
    contactInput.classList.remove('input-error');
    nicknameError.style.display = 'none';
    contactError.style.display = 'none';
    
    // Валидация
    let isValid = true;
    
    if (!nickname) {
        nicknameInput.classList.add('input-error');
        nicknameError.textContent = 'Пожалуйста, введите ваш ник';
        nicknameError.style.display = 'block';
        isValid = false;
    } else if (!validateNickname(nickname)) {
        nicknameInput.classList.add('input-error');
        nicknameError.textContent = 'Ник должен содержать только английские буквы и цифры';
        nicknameError.style.display = 'block';
        isValid = false;
    }
    
    if (!contact) {
        contactInput.classList.add('input-error');
        contactError.textContent = 'Пожалуйста, укажите контакт для связи';
        contactError.style.display = 'block';
        isValid = false;
    } else if (!validateTelegramContact(contact)) {
        contactInput.classList.add('input-error');
        contactError.textContent = 'Контакт должен начинаться с @ и содержать имя пользователя';
        contactError.style.display = 'block';
        isValid = false;
    }
    
    if (!isValid) return;
    
    confirmBtn.disabled = true;
    confirmBtn.textContent = 'Отправка...';
    
    try {
        const message = `🎯 *Новая заявка на покупку:*\n\n` +
                       `📌 *Привилегия:* ${currentPurchase.item}\n` +
                       `💰 *Цена:* ${currentPurchase.price}\n` +
                       `👤 *Ник:* ${nickname}\n` +
                       `📞 *Контакт:* ${contact}\n\n` +
                       `⏱️ ${new Date().toLocaleString()}\n` +
                       `🔗 [Ссылка](${window.location.href})`;
        
        const sendPromises = OWNER_IDS.map(ownerId => sendTelegramMessage(ownerId, message));
        await Promise.all(sendPromises);
        
        const request = {
            id: Date.now(),
            item: currentPurchase.item,
            price: currentPurchase.price,
            nickname: nickname,
            contact: contact,
            status: 'pending',
            date: new Date().toLocaleString()
        };
        
        requests.donations.push(request);
        saveRequests();
        updateAdminPanel();
        
        showStatus(statusMessage, '✅ Ваша заявка успешно отправлена! Владелец свяжется с вами в ближайшее время.', 'success');
        contactOwner.style.display = 'block';
        
        setTimeout(() => {
            modal.style.display = 'none';
        }, 3000);
        
    } catch (error) {
        console.error('Ошибка при отправке заявки:', error);
        showStatus(statusMessage, '❌ Произошла ошибка при отправке заявки. Пожалуйста, попробуйте позже или свяжитесь с владельцем напрямую.', 'error');
        contactOwner.style.display = 'block';
    } finally {
        confirmBtn.disabled = false;
        confirmBtn.textContent = 'Подтвердить';
    }
});

cancelBtn.addEventListener('click', () => {
    modal.style.display = 'none';
});

// Обработчики админ панели
adminLoginButton.addEventListener('click', () => {
    adminUsernameInput.value = '';
    adminPasswordInput.value = '';
    adminLoginStatus.style.display = 'none';
    adminUsernameError.style.display = 'none';
    adminPasswordError.style.display = 'none';
    adminUsernameInput.classList.remove('input-error');
    adminPasswordInput.classList.remove('input-error');
    
    adminLoginModal.style.display = 'flex';
});

adminLoginBtn.addEventListener('click', () => {
    const username = adminUsernameInput.value.trim();
    const password = adminPasswordInput.value.trim();
    
    adminUsernameInput.classList.remove('input-error');
    adminPasswordInput.classList.remove('input-error');
    adminUsernameError.style.display = 'none';
    adminPasswordError.style.display = 'none';
    
    let isValid = true;
    
    if (!username) {
        adminUsernameInput.classList.add('input-error');
        adminUsernameError.textContent = 'Пожалуйста, введите логин';
        adminUsernameError.style.display = 'block';
        isValid = false;
    }
    
    if (!password) {
        adminPasswordInput.classList.add('input-error');
        adminPasswordError.textContent = 'Пожалуйста, введите пароль';
        adminPasswordError.style.display = 'block';
        isValid = false;
    }
    
    if (!isValid) return;
    
    // Проверка учетных данных через API
    checkAdminCredentials(username, password)
        .then(isValid => {
            if (isValid) {
                currentAdmin = username;
                adminUsernameDisplay.textContent = currentAdmin;
                adminLoginSection.style.display = 'none';
                adminPanel.style.display = 'block';
                adminLoginModal.style.display = 'none';
                updateAdminPanel();
                localStorage.setItem('skillshop_admin', currentAdmin);
            } else {
                adminUsernameInput.classList.add('input-error');
                adminPasswordInput.classList.add('input-error');
                showStatus(adminLoginStatus, '❌ Неверный логин или пароль', 'error');
            }
        })
        .catch(error => {
            console.error('Ошибка при проверке учетных данных:', error);
            showStatus(adminLoginStatus, '❌ Ошибка сервера. Попробуйте позже.', 'error');
        });
});

// Проверка учетных данных через API
async function checkAdminCredentials(username, password) {
    try {
        const response = await fetch('https://your-api-endpoint.com/verify-admin', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password })
        });
        
        if (!response.ok) {
            throw new Error('Ошибка сервера');
        }
        
        const data = await response.json();
        return data.isValid;
    } catch (error) {
        console.error('Ошибка при проверке учетных данных:', error);
        throw error;
    }
}

adminCancelBtn.addEventListener('click', () => {
    adminLoginModal.style.display = 'none';
});

adminLogoutButton.addEventListener('click', () => {
    currentAdmin = null;
    adminLoginSection.style.display = 'block';
    adminPanel.style.display = 'none';
    localStorage.removeItem('skillshop_admin');
});

// Проверка доступности бота
async function checkBotAvailability() {
    try {
        const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getMe`);
        if (!response.ok) {
            throw new Error('Бот недоступен');
        }
        console.log('Бот доступен и работает');
        return true;
    } catch (error) {
        console.error('Ошибка при проверке бота:', error);
        return false;
    }
}

// Защита от инспектирования кода
document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
});

document.onkeydown = function(e) {
    if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key === 'I') || (e.ctrlKey && e.shiftKey && e.key === 'J') || (e.ctrlKey && e.key === 'U')) {
        return false;
    }
};

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    createFloatingCoins();
    initCase();
    loadRequests();
    checkBotAvailability();
    retryFailedRequests();
    
    if (localStorage.getItem('skillshop_admin')) {
        currentAdmin = localStorage.getItem('skillshop_admin');
        adminUsernameDisplay.textContent = currentAdmin;
        adminLoginSection.style.display = 'none';
        adminPanel.style.display = 'block';
        updateAdminPanel();
    }
});

// Конфигурационные данные (должны быть заменены на реальные)
const BOT_TOKEN = '8067754157:AAGtRl8ogrYp_C4W02qhqG-DQbkG9vEJVEc';
const OWNER_IDS = ['7807571960', '5645283070'];
