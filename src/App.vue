<template>
    <div id="app">
        <nav class="main-nav">
            <div class="nav-container">
                <div class="logo">Генератор цветовых палитр</div>
                <div class="nav-links">
                    <router-link to="/" class="nav-link"
                        >Базовый генератор</router-link
                    >
                    <router-link to="/advanced" class="nav-link"
                        >Продвинутые инструменты</router-link
                    >
                </div>
            </div>
        </nav>

        <main>
            <router-view />
        </main>

        <footer class="main-footer">
            <p>Создано на Vue 3 — проект генератора палитр</p>
        </footer>
    </div>
</template>

<script setup></script>

<style>
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
        Ubuntu, Cantarell, sans-serif;
    background: #f8f9fa;
    color: #212529;
}

#app {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
}

.main-nav {
    background: white;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    position: sticky;
    top: 0;
    z-index: 100;
}

.nav-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 1rem 2rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.logo {
    font-size: 1.25rem;
    font-weight: bold;
    color: #212529;
}

.nav-links {
    display: flex;
    gap: 1.5rem;
}

.nav-link {
    color: #495057;
    text-decoration: none;
    font-weight: 500;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    transition: all 0.2s;
}

.nav-link:hover {
    background: #f8f9fa;
    color: #007bff;
}

.nav-link.router-link-active {
    background: #007bff;
    color: white;
}

main {
    flex: 1;
    padding: 1rem 0;
}

.main-footer {
    background: white;
    border-top: 1px solid #dee2e6;
    padding: 1.5rem;
    text-align: center;
    color: #6c757d;
    margin-top: 2rem;
}

.main-footer p {
    margin: 0;
}
</style>
