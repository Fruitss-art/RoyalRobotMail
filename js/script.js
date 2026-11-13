/* ==========================================================================
   ROYAL ROBOT MAIL - CONSOLIDATED JAVASCRIPT
   Strict Role Separation & Integrated Test Datasets
   ========================================================================== */

/* =======================================
   CUSTOMER TEST DATA
   ======================================= */
const customers = [
    {
        name: "Sarah Johnson",
        email: "sarah.johnson@royalrobotmail.com",
        phone: "+44 7700 900111",
        officeRoom: "Y8-204",
        password: "Sarah123!",
        trackingNumber: "RRM001",
        status: "Processing"
    },
    {
        name: "Michael Brown",
        email: "michael.brown@royalrobotmail.com",
        phone: "+44 7700 900222",
        officeRoom: "Y8-118",
        password: "Michael123!",
        trackingNumber: "RRM002",
        status: "Out for Delivery"
    },
    {
        name: "Emma Wilson",
        email: "emma.wilson@royalrobotmail.com",
        phone: "+44 7700 900333",
        officeRoom: "Y8-307",
        password: "Emma123!",
        trackingNumber: "RRM003",
        status: "Delivered"
    }
];

/* =======================================
   WORKER TEST DATA
   ======================================= */
const workers = [
    {
        workerId: "WRK001",
        name: "John Miller",
        role: "Delivery Coordinator",
        password: "Worker123!"
    },
    {
        workerId: "WRK002",
        name: "Alice Carter",
        role: "Parcel Operations Manager",
        password: "Admin123!"
    }
];

/* =======================================
   ROLE-BASED ROUTE GUARD & INITIALIZATION
   ======================================= */
document.addEventListener('DOMContentLoaded', () => {
    const body = document.body;
    const activeRole = sessionStorage.getItem('rrm_role');

    // Enforce strict role isolation across pages
    if (body.classList.contains('page-tracking')) {
        if (activeRole === 'worker') {
            window.location.href = 'worker-dashboard.html';
            return;
        }
        if (activeRole !== 'customer') {
            window.location.href = 'login.html';
            return;
        }
        initTrackingPage();
    }

    if (body.classList.contains('page-worker-dashboard')) {
        if (activeRole !== 'worker') {
            window.location.href = 'worker-login.html';
            return;
        }
        initWorkerDashboard();
    }

    if (body.classList.contains('page-register') && activeRole === 'worker') {
        window.location.href = 'worker-dashboard.html';
    }
});

/* =======================================
   SHARED UI HELPERS (NOTIFICATIONS & INPUTS)
   ======================================= */
let toastTimeout;

function showNotification(title, message) {
    const toast = document.getElementById('toastNotification');
    if (!toast) return;
    document.getElementById('toastTitle').textContent = title;
    document.getElementById('toastMessage').textContent = message;

    toast.classList.remove('translate-y-24', 'opacity-0');
    toast.classList.add('translate-y-0', 'opacity-100');

    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
        hideToast();
    }, 4000);
}

function hideToast() {
    const toast = document.getElementById('toastNotification');
    if (!toast) return;
    toast.classList.add('translate-y-24', 'opacity-0');
    toast.classList.remove('translate-y-0', 'opacity-100');
}

function clearError(fieldId) {
    const input = document.getElementById(fieldId);
    const errorElement = document.getElementById(fieldId + 'Error');
    if (input) {
        input.classList.remove('input-error');
        input.removeAttribute('aria-invalid');
    }
    if (errorElement) {
        errorElement.classList.add('hidden');
    }
}

function toggleTooltip(id) {
    const el = document.getElementById(id);
    if (el) {
        el.classList.toggle('hidden');
    }
}

function hideTooltip(id) {
    setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.classList.add('hidden');
    }, 200);
}

function togglePasswordVisibility(inputId, iconId) {
    const pwdInput = document.getElementById(inputId);
    const eyeIcon = document.getElementById(iconId);
    if (!pwdInput || !eyeIcon) return;

    if (pwdInput.type === 'password') {
        pwdInput.type = 'text';
        eyeIcon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858-5.908a10.05 10.05 0 014.122-.963c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21M3 3l18 18"/>`;
    } else {
        pwdInput.type = 'password';
        eyeIcon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-4.477 0-8.268-2.943-9.542-7z"/>`;
    }
}

/* =======================================
   HOMEPAGE TRACKING SEARCH ROUTING
   ======================================= */
function handleTrackingSearch(event) {
    event.preventDefault();
    const parcelInput = document.getElementById('parcel-id');
    const officeInput = document.getElementById('office-room');
    const parcelError = document.getElementById('parcel-id-error');

    const parcelVal = parcelInput ? parcelInput.value.trim() : '';
    const officeVal = officeInput ? officeInput.value.trim() : '';

    if (parcelVal.length < 3) {
        if (parcelError) parcelError.classList.remove('hidden');
        if (parcelInput) parcelInput.focus();
        return;
    }

    if (parcelError) parcelError.classList.add('hidden');

    // Store optional lookup input before redirecting to Secure Login Page
    sessionStorage.setItem('rrm_lookup_parcel_id', parcelVal.toUpperCase());
    if (officeVal) {
        sessionStorage.setItem('rrm_lookup_office_room', officeVal.toUpperCase());
    }

    window.location.href = 'login.html';
}

/* =======================================
   CUSTOMER LOGIN LOGIC
   ======================================= */
function validateLoginField(fieldId) {
    const input = document.getElementById(fieldId);
    const errorElement = document.getElementById(fieldId + 'Error');
    let isValid = true;

    if (!input) return true;
    const val = input.value.trim();

    if (fieldId === 'email') {
        if (val.length < 3) isValid = false;
    } else if (fieldId === 'password') {
        if (val.length < 1) isValid = false;
    }

    if (!isValid) {
        input.classList.add('input-error');
        if (errorElement) errorElement.classList.remove('hidden');
    } else {
        input.classList.remove('input-error');
        if (errorElement) errorElement.classList.add('hidden');
    }

    return isValid;
}

function handleLoginSubmit(e) {
    e.preventDefault();
    const isEmailValid = validateLoginField('email');
    const isPasswordValid = validateLoginField('password');

    if (!isEmailValid || !isPasswordValid) {
        showNotification('Form Error', 'Please enter your email address and password.');
        return;
    }

    const emailVal = document.getElementById('email').value.trim().toLowerCase();
    const passwordVal = document.getElementById('password').value;

    // Authenticate strictly against the Customer Test Dataset
    const matchedCustomer = customers.find(
        (c) => c.email.toLowerCase() === emailVal && c.password === passwordVal
    );

    if (matchedCustomer) {
        // Store isolated Customer session and parcel tracking details
        sessionStorage.setItem('rrm_role', 'customer');
        sessionStorage.setItem('rrm_customer_name', matchedCustomer.name);
        sessionStorage.setItem('rrm_customer_user', matchedCustomer.email);
        sessionStorage.setItem('rrm_office_room', matchedCustomer.officeRoom);
        sessionStorage.setItem('rrm_parcel_id', matchedCustomer.trackingNumber);
        sessionStorage.setItem('rrm_parcel_status', matchedCustomer.status);

        window.location.href = 'tracking.html';
    } else {
        const emailInput = document.getElementById('email');
        const passwordInput = document.getElementById('password');
        if (emailInput) emailInput.classList.add('input-error');
        if (passwordInput) passwordInput.classList.add('input-error');
        showNotification(
            'Authentication Failed',
            'Invalid customer email or password. Please use a valid customer account.'
        );
    }
}

function handleCustomerLogout() {
    sessionStorage.removeItem('rrm_role');
    sessionStorage.removeItem('rrm_customer_name');
    sessionStorage.removeItem('rrm_customer_user');
    sessionStorage.removeItem('rrm_office_room');
    sessionStorage.removeItem('rrm_parcel_id');
    sessionStorage.removeItem('rrm_parcel_status');
    window.location.href = 'index.html';
}

function showForgotPasswordModal(e) {
    e.preventDefault();
    const modal = document.getElementById('forgotModal');
    if (modal) modal.classList.remove('hidden');
}

function closeForgotModal() {
    const modal = document.getElementById('forgotModal');
    if (modal) modal.classList.add('hidden');
}

function handleForgotSubmit(e) {
    e.preventDefault();
    const email = document.getElementById('forgotEmail').value;
    closeForgotModal();
    showNotification('Password Reset', `Instructions to reset your password have been sent to ${email}.`);
}

/* =======================================
   REGISTRATION FLOW (2-STEP CUSTOMER FLOW)
   ======================================= */
let currentRegStep = 1;

function validateRegField(fieldId) {
    const input = document.getElementById(fieldId);
    const errorElement = document.getElementById(fieldId + 'Error');
    let isValid = true;
    let customMsg = '';

    if (!input) return true;
    const val = input.value.trim();

    if (fieldId === 'firstName') {
        if (val.length < 2) isValid = false;
    } else if (fieldId === 'lastName') {
        if (val.length < 2) isValid = false;
    } else if (fieldId === 'email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (val === '') {
            isValid = false;
            customMsg = 'Please enter an email address.';
        } else if (!emailRegex.test(val)) {
            isValid = false;
            customMsg = 'Please enter a valid email address (e.g. name@domain.com).';
        }
        if (customMsg && document.getElementById('emailErrorText')) {
            document.getElementById('emailErrorText').textContent = customMsg;
        }
    } else if (fieldId === 'phone') {
        const digitsOnly = val.replace(/\D/g, '');
        if (digitsOnly.length < 7) isValid = false;
    } else if (fieldId === 'officeRoom') {
        if (val.length < 2) isValid = false;
    } else if (fieldId === 'password') {
        if (val.length < 8) isValid = false;
    } else if (fieldId === 'confirmPassword') {
        const pwdVal = document.getElementById('password') ? document.getElementById('password').value : '';
        if (val === '' || val !== pwdVal) isValid = false;
    }

    if (!isValid) {
        input.classList.add('input-error');
        input.setAttribute('aria-invalid', 'true');
        if (errorElement) errorElement.classList.remove('hidden');
    } else {
        input.classList.remove('input-error');
        input.removeAttribute('aria-invalid');
        if (errorElement) errorElement.classList.add('hidden');
    }

    return isValid;
}

// Step 1 Next Button Handler
function handleStep1Next(e) {
    e.preventDefault();

    const isFirstNameValid = validateRegField('firstName');
    const isLastNameValid = validateRegField('lastName');
    const isEmailValid = validateRegField('email');
    const isPhoneValid = validateRegField('phone');

    if (isFirstNameValid && isLastNameValid && isEmailValid && isPhoneValid) {
        const emailVal = document.getElementById('email').value.trim();
        document.getElementById('summaryEmail').textContent = emailVal;
        goToRegStep(2);
    } else {
        const firstInvalid = document.querySelector('#step1Card .input-error');
        if (firstInvalid) firstInvalid.focus();
    }
}

// Step 2 Submit Button Handler -> Redirects directly to tracking.html
function handleStep2Submit(e) {
    e.preventDefault();

    const isOfficeValid = validateRegField('officeRoom');
    const isPassValid = validateRegField('password');
    const isConfirmValid = validateRegField('confirmPassword');

    if (!isOfficeValid || !isPassValid || !isConfirmValid) {
        const firstInvalid = document.querySelector('#step2Card .input-error');
        if (firstInvalid) firstInvalid.focus();
        return;
    }

    const firstNameVal = document.getElementById('firstName').value.trim();
    const lastNameVal = document.getElementById('lastName').value.trim();
    const emailVal = document.getElementById('email').value.trim();
    const officeRoomVal = document.getElementById('officeRoom').value.trim().toUpperCase();
    const lookupParcel = sessionStorage.getItem('rrm_lookup_parcel_id') || 'RRM004';

    // Authenticate newly registered customer and redirect directly to Customer Tracking Page
    sessionStorage.setItem('rrm_role', 'customer');
    sessionStorage.setItem('rrm_customer_name', `${firstNameVal} ${lastNameVal}`);
    sessionStorage.setItem('rrm_customer_user', emailVal);
    sessionStorage.setItem('rrm_office_room', officeRoomVal);
    sessionStorage.setItem('rrm_parcel_id', lookupParcel);
    sessionStorage.setItem('rrm_parcel_status', 'Processing');

    window.location.href = 'tracking.html';
}

function goToRegStep(stepNum) {
    currentRegStep = stepNum;

    const step1Card = document.getElementById('step1Card');
    const step2Card = document.getElementById('step2Card');
    const stepIndicatorText = document.getElementById('stepIndicatorText');
    const stepNameText = document.getElementById('stepNameText');
    const progressBarFill = document.getElementById('progressBarFill');
    const progressBarContainer = document.getElementById('progressBarContainer');

    if (stepNum === 1) {
        step1Card.classList.remove('hidden');
        step2Card.classList.add('hidden');

        stepIndicatorText.textContent = 'Step 1 of 2';
        stepNameText.textContent = 'Personal Details';
        progressBarFill.style.width = '50%';
        if (progressBarContainer) progressBarContainer.setAttribute('aria-valuenow', '50');

        document.getElementById('pageTitle').textContent = 'Personal account';
        document.getElementById('pageSubtitle').textContent = 'We just need a few details.';
    } else if (stepNum === 2) {
        step1Card.classList.add('hidden');
        step2Card.classList.remove('hidden');

        stepIndicatorText.textContent = 'Step 2 of 2';
        stepNameText.textContent = 'Office & Security';
        progressBarFill.style.width = '100%';
        if (progressBarContainer) progressBarContainer.setAttribute('aria-valuenow', '100');

        document.getElementById('pageTitle').textContent = 'Security Setup';
        document.getElementById('pageSubtitle').textContent = 'Enter your office room and set a password.';
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function handleBackClick() {
    if (currentRegStep > 1) {
        goToRegStep(currentRegStep - 1);
    } else {
        window.location.href = 'login.html';
    }
}

/* =======================================
   TRACKING PAGE LOGIC
   ======================================= */
const StateConfigs = {
    delivered: {
        title: "It's delivered",
        subtitle: "Parcel delivered - over and out",
        progressPercent: "100%",
        showCollectionCard: false,
        activeEventIndex: 1
    },
    out_for_delivery: {
        title: "Robot is next to your office",
        subtitle: "Check your email for your QR code and Collection code",
        progressPercent: "80%",
        showCollectionCard: true,
        activeEventIndex: 2
    },
    transit: {
        title: "In Transit",
        subtitle: "Robot left the post, 3 stops before yours",
        progressPercent: "50%",
        showCollectionCard: false,
        activeEventIndex: 4
    },
    processing: {
        title: "Processing",
        subtitle: "Your parcel is currently being processed at the autonomous distribution hub.",
        progressPercent: "35%",
        showCollectionCard: false,
        activeEventIndex: 5
    },
    prepped: {
        title: "Parcel being prepped",
        subtitle: "Your package is being sorted at the autonomous distribution center.",
        progressPercent: "15%",
        showCollectionCard: false,
        activeEventIndex: 6
    }
};

function mapStatusToStateKey(statusText) {
    if (!statusText) return 'delivered';
    const normalized = statusText.trim().toLowerCase();
    if (normalized === 'processing') return 'processing';
    if (normalized === 'out for delivery') return 'out_for_delivery';
    if (normalized === 'in transit') return 'transit';
    if (normalized === 'prepped') return 'prepped';
    return 'delivered';
}

function initTrackingPage() {
    const savedParcelId = sessionStorage.getItem('rrm_parcel_id');
    const savedStatus = sessionStorage.getItem('rrm_parcel_status');
    const savedOfficeRoom = sessionStorage.getItem('rrm_office_room');
    const savedCustomerName = sessionStorage.getItem('rrm_customer_name');

    const trackingDisplay = document.getElementById('tracking-id-value');
    if (savedParcelId && trackingDisplay) {
        trackingDisplay.innerText = savedParcelId;
    }

    // Apply the logged-in customer's exact parcel status
    const stateKey = mapStatusToStateKey(savedStatus);
    setDemoState(stateKey);

    // Append customer & office context to subtitle while preserving exact layout
    const subtitleEl = document.getElementById('hero-subtitle');
    if (subtitleEl && savedCustomerName && savedOfficeRoom) {
        subtitleEl.innerText = `${StateConfigs[stateKey].subtitle} (${savedCustomerName} - Room ${savedOfficeRoom})`;
    }
}

function setDemoState(stateKey) {
    const config = StateConfigs[stateKey];
    if (!config) return;

    document.getElementById('hero-title').innerText = config.title;
    document.getElementById('hero-subtitle').innerText = config.subtitle;

    const progressSquare = document.getElementById('progress-square');
    progressSquare.style.right = (100 - parseInt(config.progressPercent, 10)) + '%';

    const collectionCard = document.getElementById('out-for-delivery-card');
    if (config.showCollectionCard) {
        collectionCard.classList.remove('hidden');
    } else {
        collectionCard.classList.add('hidden');
    }

    for (let i = 1; i <= 6; i++) {
        const marker = document.getElementById(`marker-${i}`);
        if (marker) {
            if (i === config.activeEventIndex) {
                marker.className = "w-3.5 h-3.5 bg-[#FFD200] flex-shrink-0 mt-1 shadow-2xs rounded-none";
            } else {
                marker.className = "w-3.5 h-3.5 bg-[#D1D5DB] flex-shrink-0 mt-1 rounded-none";
            }
        }
    }

    const dropdown = document.getElementById('stage-select-dropdown');
    if (dropdown && dropdown.value !== stateKey) {
        dropdown.value = stateKey;
    }
}

function copyTrackingNo() {
    const trackingNo = document.getElementById('tracking-id-value').innerText;
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(trackingNo).catch(() => { });
    } else {
        const tempInput = document.createElement('textarea');
        tempInput.value = trackingNo;
        document.body.appendChild(tempInput);
        tempInput.select();
        document.execCommand('copy');
        document.body.removeChild(tempInput);
    }
}

/* =======================================
   WORKER LOGIN LOGIC
   ======================================= */
function validateWorkerField(fieldId) {
    const input = document.getElementById(fieldId);
    const errorElement = document.getElementById(fieldId + 'Error');
    let isValid = true;

    if (!input) return true;
    const val = input.value.trim();

    if (fieldId === 'workerId') {
        if (val.length < 2) isValid = false;
    } else if (fieldId === 'workerPassword') {
        if (val.length < 1) isValid = false;
    }

    if (!isValid) {
        input.classList.add('input-error');
        if (errorElement) errorElement.classList.remove('hidden');
    } else {
        input.classList.remove('input-error');
        if (errorElement) errorElement.classList.add('hidden');
    }

    return isValid;
}

function handleWorkerLoginSubmit(e) {
    e.preventDefault();
    const isIdValid = validateWorkerField('workerId');
    const isPassValid = validateWorkerField('workerPassword');

    if (!isIdValid || !isPassValid) {
        showNotification('Staff Authentication Error', 'Please enter your Worker ID and Password.');
        return;
    }

    const workerIdVal = document.getElementById('workerId').value.trim().toUpperCase();
    const workerPassVal = document.getElementById('workerPassword').value;

    // Authenticate strictly against the Worker Test Dataset
    const matchedWorker = workers.find(
        (w) => w.workerId.toUpperCase() === workerIdVal && w.password === workerPassVal
    );

    if (matchedWorker) {
        // Establish isolated Worker session and redirect strictly to Worker Dashboard
        sessionStorage.setItem('rrm_role', 'worker');
        sessionStorage.setItem('rrm_worker_id', matchedWorker.workerId);
        sessionStorage.setItem('rrm_worker_name', matchedWorker.name);
        sessionStorage.setItem('rrm_worker_role', matchedWorker.role);
        window.location.href = 'worker-dashboard.html';
    } else {
        const idInput = document.getElementById('workerId');
        const passInput = document.getElementById('workerPassword');
        if (idInput) idInput.classList.add('input-error');
        if (passInput) passInput.classList.add('input-error');
        showNotification(
            'Staff Access Denied',
            'Invalid Worker ID or Password. Please use authorized worker credentials.'
        );
    }
}

function handleWorkerLogout() {
    sessionStorage.removeItem('rrm_role');
    sessionStorage.removeItem('rrm_worker_id');
    sessionStorage.removeItem('rrm_worker_name');
    sessionStorage.removeItem('rrm_worker_role');
    window.location.href = 'worker-login.html';
}

/* =======================================
   WORKER DASHBOARD LOGIC
   ======================================= */
const DashboardData = {
    emergencyStop: false,

    compartments: [
        {
            number: 1,
            recipient: 'Sarah Johnson',
            contents: 'Parcel (RRM001)',
            status: 'Processing',
            doorState: 'Locked',
            collectionState: 'Pending',
            verification: 'QR Code Issued'
        },
        {
            number: 2,
            recipient: 'Michael Brown',
            contents: 'Parcel (RRM002)',
            status: 'Out for Delivery',
            doorState: 'Locked',
            collectionState: 'Awaiting Collection',
            verification: 'QR Code Issued'
        },
        {
            number: 3,
            recipient: 'Emma Wilson',
            contents: 'Parcel (RRM003)',
            status: 'Delivered',
            doorState: 'Closed',
            collectionState: 'Collected',
            verification: 'Verified'
        },
        {
            number: 4,
            recipient: '',
            contents: '',
            status: 'Empty',
            doorState: 'Closed',
            collectionState: 'Empty',
            verification: 'Not Assigned'
        }
    ],

    dispatchQueue: [
        { recipient: 'Michael Brown (RRM002)', room: 'Y8-118', priority: 'High' },
        { recipient: 'Sarah Johnson (RRM001)', room: 'Y8-204', priority: 'Normal' },
        { recipient: 'Emma Wilson (RRM003)', room: 'Y8-307', priority: 'Normal' }
    ],

    failedDeliveries: [
        {
            id: 'FD-1',
            recipient: 'Engineering Office',
            room: 'Room Y8-214',
            reason: 'Recipient did not collect parcel within timeout period.',
            actionStatus: 'Awaiting Staff Action'
        },
        {
            id: 'FD-2',
            recipient: 'Admissions',
            room: 'Room Y8-108',
            reason: 'Recipient did not collect parcel within timeout period.',
            actionStatus: 'Awaiting Staff Action'
        }
    ]
};

function initWorkerDashboard() {
    const workerBadge = document.getElementById('worker-badge-id');
    const savedWorkerId = sessionStorage.getItem('rrm_worker_id');
    const savedWorkerName = sessionStorage.getItem('rrm_worker_name');
    const savedWorkerRole = sessionStorage.getItem('rrm_worker_role');

    if (workerBadge && savedWorkerId) {
        workerBadge.textContent = savedWorkerName
            ? `${savedWorkerName} (${savedWorkerId})  ${savedWorkerRole}`
            : `Staff ID: ${savedWorkerId}`;
    }

    renderCompartments();
    renderDispatchQueue();
    renderFailedDeliveries();
    renderCollections();
}

function showFeedback(text) {
    const box = document.getElementById('action-feedback');
    if (!box) return;
    box.textContent = text;
    box.classList.remove('hidden');
}

function handleDispatchRobot() {
    if (DashboardData.emergencyStop) {
        showFeedback('Cannot dispatch robot while Emergency Stop is Activated.');
        return;
    }
    const firstStop = DashboardData.dispatchQueue[0];
    const dest = firstStop ? `${firstStop.room} ${firstStop.recipient}` : 'B-118 Michael Brown (RRM002)';

    document.getElementById('robot-status-val').textContent = 'Delivering Mail';
    document.getElementById('robot-location-val').textContent = 'Floor 2 - Corridor B';
    document.getElementById('robot-dest-val').textContent = dest;
    document.getElementById('robot-eta-val').textContent = '2 Minutes';

    document.getElementById('nav-floor-val').textContent = 'Floor 2';
    document.getElementById('nav-corridor-val').textContent = 'Corridor B';
    document.getElementById('nav-room-val').textContent = firstStop ? firstStop.room : 'B-118';
    document.getElementById('nav-route-val').textContent = 'Active';

    document.getElementById('bat-charging-val').textContent = 'Not Charging';
    document.getElementById('bat-dock-val').textContent = 'Away From Dock';

    showFeedback(`Robot dispatched to ${dest}.`);
}

function handleRecallToDock() {
    if (DashboardData.emergencyStop) {
        showFeedback('Cannot recall robot while Emergency Stop is Activated.');
        return;
    }
    document.getElementById('robot-status-val').textContent = 'Returning To Dock';
    document.getElementById('robot-location-val').textContent = 'Post Room Dock (Ground Floor)';
    document.getElementById('robot-dest-val').textContent = 'Post Room Dock';
    document.getElementById('robot-eta-val').textContent = '0 Minutes';

    document.getElementById('nav-floor-val').textContent = 'Ground Floor';
    document.getElementById('nav-corridor-val').textContent = 'Post Room Dock';
    document.getElementById('nav-room-val').textContent = 'Post Room';
    document.getElementById('nav-route-val').textContent = 'Docked';

    document.getElementById('bat-charging-val').textContent = 'Charging';
    document.getElementById('bat-dock-val').textContent = 'Docked';

    showFeedback('Robot recalled to Post Room Dock.');
}

function toggleEmergencyStop() {
    DashboardData.emergencyStop = !DashboardData.emergencyStop;
    const btn = document.getElementById('btn-toggle-estop');
    const estopVal = document.getElementById('sys-estop-val');
    const motorsVal = document.getElementById('sys-motors-val');

    if (DashboardData.emergencyStop) {
        estopVal.textContent = 'Activated';
        estopVal.className = 'font-bold text-[#D71920]';
        motorsVal.textContent = 'Disabled';
        document.getElementById('robot-status-val').textContent = 'Emergency Stop Activated';
        document.getElementById('nav-route-val').textContent = 'Halted';
        btn.textContent = 'Reset Emergency Stop';
        btn.className = 'px-4 py-2.5 bg-white text-gray-900 border border-gray-400 text-sm font-bold cursor-pointer';
        showFeedback('Emergency Stop Activated. Drive motors disabled.');
    } else {
        estopVal.textContent = 'Not Activated';
        estopVal.className = 'font-bold text-gray-900';
        motorsVal.textContent = 'Online';
        document.getElementById('robot-status-val').textContent = 'Delivering Mail';
        document.getElementById('nav-route-val').textContent = 'Active';
        btn.textContent = 'Activate Emergency Stop';
        btn.className = 'px-4 py-2.5 bg-[#D71920] text-white text-sm font-bold cursor-pointer';
        showFeedback('Emergency Stop Reset. Motor controllers online.');
    }
}

function renderCompartments() {
    const container = document.getElementById('compartments-list');
    if (!container) return;

    container.innerHTML = DashboardData.compartments.map(comp => {
        if (comp.status === 'Empty') {
            return `
                <div class="p-4 border border-gray-300 bg-[#F2F2F2]/60 text-sm">
                    <p class="font-bold text-gray-900">Compartment ${comp.number}</p>
                    <p class="text-slate-600 mt-1">Status: <span class="font-semibold text-gray-900">Empty</span></p>
                </div>
            `;
        }
        return `
            <div class="p-4 border border-gray-300 bg-white text-sm">
                <p class="font-bold text-gray-900">Compartment ${comp.number}</p>
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-1.5 text-slate-600">
                    <p>Recipient: <span class="font-semibold text-gray-900">${comp.recipient}</span></p>
                    <p>Contents: <span class="font-semibold text-gray-900">${comp.contents}</span></p>
                    <p>Status: <span class="font-semibold text-gray-900">${comp.status}</span></p>
                </div>
            </div>
        `;
    }).join('');
}

function switchTab(tabId, clickedTab) {
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.className = 'nav-tab pb-3 text-sm font-semibold text-slate-600 border-b-4 border-transparent whitespace-nowrap cursor-pointer';
    });
    clickedTab.className = 'nav-tab pb-3 text-sm font-bold text-[#D71920] border-b-4 border-[#D71920] whitespace-nowrap cursor-pointer';

    document.querySelectorAll('.tab-panel').forEach(panel => {
        panel.classList.add('hidden');
    });
    document.getElementById(`tab-${tabId}`).classList.remove('hidden');
}

function renderDispatchQueue() {
    const tbody = document.getElementById('queue-table-body');
    if (!tbody) return;

    tbody.innerHTML = DashboardData.dispatchQueue.map((item, idx) => `
        <tr>
            <td class="py-3 px-3 font-semibold text-gray-900">${item.recipient}</td>
            <td class="py-3 px-3 text-gray-800">${item.room}</td>
            <td class="py-3 px-3 text-gray-800">${item.priority}</td>
            <td class="py-3 px-3 font-bold text-gray-900">${idx + 1}</td>
            <td class="py-3 px-3 text-right space-x-2">
                <button type="button" onclick="moveQueueItem(${idx}, -1)" ${idx === 0 ? 'disabled class="px-3 py-1 border border-gray-200 text-xs text-gray-400"' : 'class="px-3 py-1 border border-gray-300 text-xs font-semibold text-gray-900 bg-white cursor-pointer"'}>
                    Move Up
                </button>
                <button type="button" onclick="moveQueueItem(${idx}, 1)" ${idx === DashboardData.dispatchQueue.length - 1 ? 'disabled class="px-3 py-1 border border-gray-200 text-xs text-gray-400"' : 'class="px-3 py-1 border border-gray-300 text-xs font-semibold text-gray-900 bg-white cursor-pointer"'}>
                    Move Down
                </button>
            </td>
        </tr>
    `).join('');
}

function moveQueueItem(index, direction) {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= DashboardData.dispatchQueue.length) return;
    const [moved] = DashboardData.dispatchQueue.splice(index, 1);
    DashboardData.dispatchQueue.splice(newIndex, 0, moved);
    renderDispatchQueue();
    showFeedback(`Updated delivery order for ${moved.recipient} (${moved.room}).`);
}

function reorderRouteByPriority() {
    const weight = { High: 1, Normal: 2, Low: 3 };
    DashboardData.dispatchQueue.sort((a, b) => {
        if (weight[a.priority] !== weight[b.priority]) {
            return weight[a.priority] - weight[b.priority];
        }
        return a.room.localeCompare(b.room);
    });
    renderDispatchQueue();
    showFeedback('Route reordered by priority and floor/room sequence.');
}

function addNewParcel(event) {
    event.preventDefault();
    const recipient = document.getElementById('input-recipient').value.trim();
    const room = document.getElementById('input-room').value.trim();
    const priority = document.getElementById('input-priority').value;
    const compNum = parseInt(document.getElementById('input-compartment').value, 10);

    if (!recipient || !room) return;

    DashboardData.dispatchQueue.push({ recipient, room, priority });

    const comp = DashboardData.compartments.find(c => c.number === compNum);
    if (comp) {
        comp.recipient = recipient;
        comp.contents = priority === 'High' ? 'Parcel' : 'Letter';
        comp.status = 'Loaded';
        comp.doorState = 'Locked';
        comp.collectionState = 'Pending';
        comp.verification = 'QR Code Issued';
    }

    renderDispatchQueue();
    renderCompartments();
    renderCollections();
    event.target.reset();
    showFeedback(`Added ${recipient} (${room}) to Dispatch Queue and Compartment ${compNum}.`);
}

function renderFailedDeliveries() {
    const container = document.getElementById('failed-deliveries-container');
    if (!container) return;

    container.innerHTML = DashboardData.failedDeliveries.map(item => `
        <div class="p-5 border border-gray-300 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div class="space-y-1 text-sm">
                <p class="font-bold text-gray-900 text-base">${item.recipient}</p>
                <p class="text-slate-600 font-medium">${item.room}</p>
                <p class="text-gray-800">${item.reason}</p>
                <p class="text-xs font-bold text-gray-900 pt-1">Status: ${item.actionStatus}</p>
            </div>
            <div class="flex flex-wrap gap-2.5 shrink-0">
                <button type="button" onclick="updateFailedDelivery('${item.id}', 'Rescheduled for Next Delivery Run')" class="px-4 py-2 bg-[#D71920] text-white text-sm font-bold cursor-pointer">
                    Reschedule
                </button>
                <button type="button" onclick="updateFailedDelivery('${item.id}', 'Returned To Post Room')" class="px-4 py-2 bg-white text-gray-900 text-sm font-bold border border-gray-400 cursor-pointer">
                    Return To Post Room
                </button>
            </div>
        </div>
    `).join('');
}

function updateFailedDelivery(id, newStatus) {
    const entry = DashboardData.failedDeliveries.find(f => f.id === id);
    if (!entry) return;
    entry.actionStatus = newStatus;
    renderFailedDeliveries();
    showFeedback(`${entry.recipient} (${entry.room}) updated: ${newStatus}.`);
}

function renderCollections() {
    const tbody = document.getElementById('collections-table-body');
    if (!tbody) return;

    tbody.innerHTML = DashboardData.compartments.map(comp => `
        <tr>
            <td class="py-3 px-3 font-bold text-gray-900">Compartment ${comp.number}</td>
            <td class="py-3 px-3 text-gray-800">${comp.doorState}</td>
            <td class="py-3 px-3 text-gray-800">${comp.collectionState}</td>
            <td class="py-3 px-3 text-gray-800">${comp.verification}</td>
        </tr>
    `).join('');
}
