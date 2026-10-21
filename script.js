const form = document.getElementById('regForm');
const statusBox = document.getElementById('form-status');

// Helper function to show errors
function showError(input, errorElement, message) {
    input.setAttribute('aria-invalid', 'true');
    if (errorElement) errorElement.textContent = message;
}

// Helper function to clear errors
function clearError(input, errorElement) {
    input.setAttribute('aria-invalid', 'false');
    if (errorElement) errorElement.textContent = '';
}

// Shared validator — used on blur (as the user tabs through) AND re-run
// for every field at submit time, so a field nobody ever blurred still
// gets its red border + message rather than just silently stealing focus.
function validateTextField(input, errorSpan) {
    if (input.validity.valueMissing) {
        showError(input, errorSpan, input.tagName === 'SELECT' ? "Please select a programme." : "This field is required.");
    } else if (input.validity.typeMismatch) {
        showError(input, errorSpan, "Please enter a valid format.");
    } else if (input.validity.patternMismatch) {
        showError(input, errorSpan, "Please match the requested format.");
    } else {
        clearError(input, errorSpan);
    }
    return !input.validity.valueMissing && !input.validity.typeMismatch && !input.validity.patternMismatch;
}

// Real-time validation on input blur (when user leaves the field)
const inputsToValidate = ['fullName', 'email', 'phone'];
inputsToValidate.forEach(id => {
    const input = document.getElementById(id);
    const errorSpan = document.getElementById(`${id === 'fullName' ? 'name' : id}-error`);
    input.addEventListener('blur', () => validateTextField(input, errorSpan));
});

// Select validation (Programme) — was previously silent on failure
const programmeSelect = document.getElementById('programme');
const programmeError = document.getElementById('programme-error');

programmeSelect.addEventListener('blur', () => validateTextField(programmeSelect, programmeError));
programmeSelect.addEventListener('change', () => validateTextField(programmeSelect, programmeError));

// Radio group validation (Mode of Study) — was previously silent on failure
const modeRadios = document.querySelectorAll('input[name="mode"]');
const modeError = document.getElementById('mode-error');
const modeFieldset = modeRadios[0].closest('fieldset');

function validateMode() {
    const checked = Array.from(modeRadios).some(radio => radio.checked);
    if (!checked) {
        modeError.textContent = "Please select a mode of study.";
        modeFieldset.classList.add('invalid');
        modeRadios.forEach(radio => radio.setAttribute('aria-invalid', 'true'));
    } else {
        modeError.textContent = '';
        modeFieldset.classList.remove('invalid');
        modeRadios.forEach(radio => radio.setAttribute('aria-invalid', 'false'));
    }
    return checked;
}

modeRadios.forEach(radio => {
    radio.addEventListener('change', validateMode);
});

// Form submission
form.addEventListener('submit', function(event) {
    event.preventDefault(); // Stop page reload

    // Re-run every field's own validation at submit time — not just the
    // ones the user happened to already blur. Without this, a field a
    // mouse-only user never left focus on would fail checkValidity() and
    // steal focus, but show no red border or message of its own.
    inputsToValidate.forEach(id => {
        const input = document.getElementById(id);
        const errorSpan = document.getElementById(`${id === 'fullName' ? 'name' : id}-error`);
        validateTextField(input, errorSpan);
    });
    validateTextField(programmeSelect, programmeError);
    validateMode();

    // Check if form is entirely valid
    if (!form.checkValidity()) {
        statusBox.className = 'status-box error';
        statusBox.textContent = 'Error: Please fix the highlighted fields before submitting.';

        // Focus the first invalid input for keyboard users
        const firstInvalid = form.querySelector('[aria-invalid="true"], :invalid');
        if (firstInvalid) firstInvalid.focus();

    } else {
        statusBox.className = 'status-box success';
        statusBox.textContent = 'Success! Your registration has been submitted.';
        form.reset();
        // Clear any error state left over from this submission — reset()
        // clears field values but not our own aria-invalid/error text.
        inputsToValidate.forEach(id => {
            const input = document.getElementById(id);
            const errorSpan = document.getElementById(`${id === 'fullName' ? 'name' : id}-error`);
            clearError(input, errorSpan);
        });
        clearError(programmeSelect, programmeError);
        modeError.textContent = '';
        modeFieldset.classList.remove('invalid');
        modeRadios.forEach(radio => radio.setAttribute('aria-invalid', 'false'));
    }
});
