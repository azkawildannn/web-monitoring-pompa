const socket = io();

socket.on("mqttData", (data) => {

    console.log(data);

    document.getElementById("suhu").innerHTML =
        data.suhu + " °C";

    document.getElementById("kelembapan").innerHTML =
        data.kelembapan + " %";

    document.getElementById("pompa").innerHTML =
        data.pompa;

    document.getElementById("mode").innerHTML =
        data.mode;
});

socket.on("mqttStatus", () => {

    document.getElementById("mqttStatus").innerHTML =
        "Connected";

    document.getElementById("mqttStatus").style.background =
        "green";
});

function kirim(perintah)
{
    console.log("Kirim:", perintah);

    fetch("/control", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            command: perintah
        })
    })
    .then(res => res.json())
    .then(data => {
        console.log(data);
    })
    .catch(err => {
        console.error(err);
    });
}

const themeToggle = document.getElementById('themeToggle');
const themeButtons = document.querySelectorAll('.theme-toggle button');

function setTheme(theme) {
    document.body.classList.toggle('dark', theme === 'dark');
    document.body.classList.toggle('light', theme === 'light');
    localStorage.setItem('theme', theme);

    if (themeToggle) {
        themeToggle.dataset.theme = theme;
    }

    themeButtons.forEach(button => {
        const isActive = button.classList.contains(`theme-${theme}`);
        button.classList.toggle('active', isActive);
    });
}

function initializeTheme() {
    const savedTheme = localStorage.getItem('theme');
    const preferredTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    setTheme(savedTheme || preferredTheme);
}

themeButtons.forEach(button => {
    button.addEventListener('click', () => {
        const theme = button.classList.contains('theme-dark') ? 'dark' : 'light';
        setTheme(theme);
    });
});

initializeTheme();