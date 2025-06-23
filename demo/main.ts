import Swal from './dist/swal.umd';

declare global {
    interface Window {
        testBasic: () => void;
        testSuccess: () => void;
        testError: () => void;
        testConfirm: () => void;
        testInput: () => void;
        testToast: () => void;
        testTimer: () => void;
        testCustom: () => void;
    }
}

function testBasic() {
    Swal.fire({
        title: 'Hello World!',
        text: 'This is a basic alert using our SweetAlert2 clone.',
        icon: 'info'
    });
}

function testSuccess() {
    Swal.fire({
        title: 'Success!',
        text: 'Your operation was completed successfully.',
        icon: 'success',
        timer: 3000,
        timerProgressBar: true
    });
}

function testError() {
    Swal.fire({
        title: 'Error!',
        text: 'Something went wrong.',
        icon: 'error',
        confirmButtonColor: '#d33'
    });
}

function testConfirm() {
    Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'Cancel'
    }).then((result) => {
        if (result.isConfirmed) {
            Swal.fire({
                title: 'Deleted!',
                text: 'Your file has been deleted.',
                icon: 'success'
            });
        }
    });
}

function testInput() {
    Swal.fire({
        title: 'Enter your name',
        input: 'text',
        inputPlaceholder: 'Your name here...',
        showCancelButton: true,
        inputValidator: (value): Promise<string | null> | string | null => {
            if (!value) {
                return 'You need to write something!';
            }
            return null;
        }
    }).then((result) => {
        if (result.isConfirmed) {
            Swal.fire({
                title: `Hello ${result.value}!`
            });
        }
    });
}

function testToast() {
    Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'Signed in successfully',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true
    });
}

function testTimer() {
    let timerInterval: NodeJS.Timeout;
    let startTime: number;
    
    Swal.fire({
        title: 'Auto close alert!',
        html: 'I will close in <b>5000</b> milliseconds.',
        timer: 5000,
        timerProgressBar: true,
        didOpen: (popup) => {
            startTime = Date.now();
            const b = popup.querySelector('b');
            if (b) {
                timerInterval = setInterval(() => {
                    const timeLeft = Math.max(0, 5000 - (Date.now() - startTime));
                    b.textContent = timeLeft.toString();
                }, 100);
            }
        },
        willClose: () => {
            if (timerInterval) {
                clearInterval(timerInterval);
            }
        }
    }).then((result) => {
        if (!result.isConfirmed && !result.isDenied && !result.isDismissed) {
            console.log('I was closed by the timer');
        }
    });
}

function testCustom() {
    Swal.fire({
        title: 'Custom HTML',
        html: `
                    <div style="text-align: left;">
                        <p>This alert uses custom HTML content.</p>
                        <ul>
                            <li>✓ Custom styling</li>
                            <li>✓ Rich content</li>
                            <li>✓ Multiple elements</li>
                        </ul>
                    </div>
                `,
        imageUrl: 'https://via.placeholder.com/150x150?text=Custom',
        imageWidth: 150,
        imageHeight: 150,
        imageAlt: 'Custom image',
        confirmButtonText: 'Cool!',
        confirmButtonColor: '#3085d6',
        footer: '<a href="#">Need help?</a>',
        customClass: {
            container: 'my-swal'
        }
    });
}

// Expose functions to window object
window.testBasic = testBasic;
window.testSuccess = testSuccess;
window.testError = testError;
window.testConfirm = testConfirm;
window.testInput = testInput;
window.testToast = testToast;
window.testTimer = testTimer;
window.testCustom = testCustom;