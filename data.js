<!DOCTYPE html>
<html lang="id">

<head>

    <meta charset="UTF-8">

    <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
    >

    <meta
        name="theme-color"
        content="#102536"
        id="themeColorMeta"
    >

    <meta
        name="mobile-web-app-capable"
        content="yes"
    >

    <meta
        name="apple-mobile-web-app-capable"
        content="yes"
    >

    <meta
        name="apple-mobile-web-app-status-bar-style"
        content="black-translucent"
    >

    <meta
        name="apple-mobile-web-app-title"
        content="TARSUS Finder"
    >

    <meta
        name="description"
        content="TARSUS Finder - Pencarian Tarif Khusus Perjalanan Kereta Api"
    >

    <title>
        TARSUS Finder
    </title>


    <!-- PWA -->

    <link
        rel="manifest"
        href="/tarsus-backup/manifest.json"
    >


    <!-- FONT -->

    <link
        rel="preconnect"
        href="https://fonts.googleapis.com"
    >

    <link
        rel="preconnect"
        href="https://fonts.gstatic.com"
        crossorigin
    >

    <link
        href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Manrope:wght@600;700;800&display=swap"
        rel="stylesheet"
    >


    <style>

        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        html {
            min-height: 100%;
            scroll-behavior: smooth;
        }

        body {
            min-height: 100vh;
            font-family: "DM Sans", sans-serif;
            background: #0b202d;
            color: #eaf2f1;
        }

        button,
        input,
        textarea,
        select {
            font-family: inherit;
        }

        button {
            -webkit-tap-highlight-color: transparent;
        }

        input,
        textarea,
        select {
            -webkit-tap-highlight-color: transparent;
        }

    </style>

</head>
    <style>

        :root {

            --navy: #0b202d;
            --navy-2: #102536;
            --panel: #123040;

            --white: #f4f8f7;
            --soft: #dce9e7;
            --muted: #8ca6ad;

            --gold: #e4c783;
            --gold-soft: #cdb474;

            --kai-green: #6fb7a7;
            --kai-green-light: #8bc9ba;

            --orange: #d98282;

            --border:
                rgba(220,240,240,.11);

            --orange-border:
                rgba(217,130,130,.20);

            --shadow:
                0 25px 70px
                rgba(2,16,24,.28);

            --sidebar-width: 290px;

        }


        body.light-theme {

            --navy: #eef5f4;
            --navy-2: #f5f9f8;
            --panel: #ffffff;

            --white: #17303b;
            --soft: #304850;
            --muted: #6c858d;

            --border:
                rgba(23,48,59,.10);

            --orange-border:
                rgba(190,105,105,.18);

            --shadow:
                0 20px 55px
                rgba(20,45,55,.10);

        }


        body {

            background-color:
                var(--navy);

            background-image:
                linear-gradient(
                    rgba(111,183,167,.025) 1px,
                    transparent 1px
                ),
                linear-gradient(
                    90deg,
                    rgba(111,183,167,.025) 1px,
                    transparent 1px
                );

            background-size:
                45px 45px;

            transition:
                background-color .3s ease,
                color .3s ease;

        }


        ::selection {

            color:
                #17303b;

            background:
                var(--gold);

        }


        ::-webkit-scrollbar {

            width:
                5px;

        }


        ::-webkit-scrollbar-track {

            background:
                transparent;

        }


        ::-webkit-scrollbar-thumb {

            background:
                rgba(111,183,167,.35);

            border-radius:
                10px;

        }


        .app {

            width:
                min(100% - 28px, 760px);

            margin:
                0 auto;

            padding:
                18px 0 35px;

        }


        @media (max-width: 680px) {

            .app {

                width:
                    min(100% - 22px, 760px);

                padding:
                    12px 0 28px;

            }

        }

    </style>
    <style>

        .topbar {

            display:
                flex;

            align-items:
                center;

            justify-content:
                space-between;

            min-height:
                48px;

            margin-bottom:
                30px;

        }


        .topbar-left {

            display:
                flex;

            align-items:
                center;

            gap:
                12px;

        }


        .menu-button {

            width:
                42px;

            height:
                42px;

            display:
                grid;

            place-items:
                center;

            border:
                1px solid var(--border);

            border-radius:
                13px;

            background:
                rgba(220,240,240,.035);

            cursor:
                pointer;

        }


        .menu-icon {

            width:
                18px;

            display:
                flex;

            flex-direction:
                column;

            gap:
                4px;

        }


        .menu-icon span {

            display:
                block;

            width:
                100%;

            height:
                2px;

            border-radius:
                2px;

            background:
                var(--soft);

            transition:
                .25s ease;

        }


        .brand-mini-name {

            color:
                var(--gold);

            font-family:
                Manrope, sans-serif;

            font-size:
                12px;

            font-weight:
                800;

            letter-spacing:
                .16em;

        }


        .brand-mini-sub {

            margin-top:
                2px;

            color:
                var(--muted);

            font-size:
                7px;

        }


        .version-badge {

            padding:
                6px 9px;

            border:
                1px solid
                rgba(228,199,131,.16);

            border-radius:
                8px;

            color:
                var(--gold);

            background:
                rgba(228,199,131,.035);

            font-size:
                8px;

            font-weight:
                700;

        }


        .header {

            margin-bottom:
                24px;

        }


        .kai-label {

            display:
                inline-flex;

            margin-bottom:
                8px;

            padding:
                5px 8px;

            border:
                1px solid
                rgba(111,183,167,.20);

            border-radius:
                7px;

            color:
                var(--kai-green-light);

            background:
                rgba(111,183,167,.045);

            font-size:
                7px;

            font-weight:
                800;

            letter-spacing:
                .16em;

        }


        .header h1 {

            color:
                var(--white);

            font-family:
                Manrope, sans-serif;

            font-size:
                clamp(28px, 7vw, 42px);

            font-weight:
                800;

            letter-spacing:
                -.045em;

            line-height:
                1;

        }


        .subtitle {

            margin-top:
                9px;

            color:
                var(--muted);

            font-size:
                11px;

        }


        @media (max-width: 680px) {

            .topbar {

                margin-bottom:
                    24px;

            }

            .header {

                margin-bottom:
                    19px;

            }

            .header h1 {

                font-size:
                    29px;

            }

        }

    </style>

</head>
<body>

    <!-- ================================================
         SPLASH SCREEN
    ================================================= -->

    <div
        class="splash"
        id="splash"
    >

        <div class="splash-light"></div>

        <div class="splash-content">

            <div class="splash-kai">
                KAI 121
            </div>

            <div class="splash-title">
                TARSUS
            </div>

            <div class="splash-subtitle">
                TARIF KHUSUS FINDER
            </div>

            <div
                class="splash-status"
                id="splashStatus"
            >
                Menyiapkan aplikasi...
            </div>

            <div class="speed-lines">

                <span></span>
                <span></span>
                <span></span>

            </div>

            <div class="train">

                <div class="track"></div>

                <div class="coach coach-1"></div>
                <div class="coach coach-2"></div>
                <div class="coach coach-3"></div>

                <div class="locomotive">

                    <div class="window"></div>

                    <div class="lamp"></div>

                </div>

            </div>

        </div>


        <div class="splash-footer">
            KAI CONTACT CENTER 121
        </div>

    </div>


    <div class="bg-orbit"></div>

    <div
        class="sidebar-overlay"
        id="sidebarOverlay"
    ></div>
    <style>

        .splash {

            position:
                fixed;

            inset:
                0;

            z-index:
                1000;

            display:
                grid;

            place-items:
                center;

            overflow:
                hidden;

            background:
                #081923;

            transition:
                opacity .35s ease,
                visibility .35s ease;

        }


        .splash.hidden {

            opacity:
                0;

            visibility:
                hidden;

            pointer-events:
                none;

        }


        .splash-light {

            position:
                absolute;

            width:
                420px;

            height:
                420px;

            border-radius:
                50%;

            background:
                radial-gradient(
                    circle,
                    rgba(111,183,167,.13),
                    transparent 68%
                );

            filter:
                blur(8px);

        }


        .splash-content {

            position:
                relative;

            z-index:
                2;

            text-align:
                center;

        }


        .splash-kai {

            color:
                var(--gold);

            font-size:
                10px;

            font-weight:
                800;

            letter-spacing:
                .35em;

            animation:
                splashUp .6s ease both;

        }


        .splash-title {

            margin-top:
                10px;

            color:
                #f4f8f7;

            font-family:
                Manrope, sans-serif;

            font-size:
                clamp(42px, 14vw, 70px);

            font-weight:
                800;

            letter-spacing:
                -.06em;

            animation:
                splashUp .65s .08s ease both;

        }


        .splash-subtitle {

            margin-top:
                5px;

            color:
                #7fa1a9;

            font-size:
                8px;

            font-weight:
                700;

            letter-spacing:
                .26em;

            animation:
                splashUp .65s .15s ease both;

        }


        .splash-status {

            margin-top:
                22px;

            color:
                #73929b;

            font-size:
                9px;

            animation:
                splashUp .65s .22s ease both;

        }


        .speed-lines {

            display:
                flex;

            justify-content:
                center;

            gap:
                7px;

            margin-top:
                13px;

        }


        .speed-lines span {

            width:
                22px;

            height:
                2px;

            border-radius:
                2px;

            background:
                var(--gold);

            animation:
                speedLine 1s ease-in-out infinite;

        }


        .speed-lines span:nth-child(2) {

            animation-delay:
                .15s;

        }


        .speed-lines span:nth-child(3) {

            animation-delay:
                .3s;

        }


        @keyframes speedLine {

            0%,100% {

                opacity:
                    .2;

                transform:
                    scaleX(.5);

            }

            50% {

                opacity:
                    1;

                transform:
                    scaleX(1);

            }

        }


        .train {

            position:
                relative;

            width:
                240px;

            height:
                48px;

            margin:
                30px auto 0;

            animation:
                trainFloat 1.8s ease-in-out infinite;

        }


        .track {

            position:
                absolute;

            bottom:
                0;

            left:
                0;

            width:
                100%;

            height:
                2px;

            background:
                #31505b;

        }


        .coach,
        .locomotive {

            position:
                absolute;

            bottom:
                7px;

            height:
                27px;

            border:
                1px solid
                #41636d;

            border-radius:
                5px 5px 2px 2px;

            background:
                #173b4b;

        }


        .coach {

            width:
                48px;

        }


        .coach-1 {

            left:
                10px;

        }


        .coach-2 {

            left:
                63px;

        }


        .coach-3 {

            left:
                116px;

        }


        .locomotive {

            right:
                8px;

            width:
                62px;

            background:
                #1e4656;

        }


        .window {

            position:
                absolute;

            top:
                6px;

            left:
                7px;

            width:
                18px;

            height:
                9px;

            border-radius:
                2px;

            background:
                #a7c8c7;

        }


        .lamp {

            position:
                absolute;

            right:
                -3px;

            top:
                12px;

            width:
                5px;

            height:
                5px;

            border-radius:
                50%;

            background:
                var(--gold);

            box-shadow:
                0 0 12px
                var(--gold);

        }


        @keyframes trainFloat {

            0%,100% {

                transform:
                    translateX(-3px);

            }

            50% {

                transform:
                    translateX(3px);

            }

        }


        @keyframes splashUp {

            from {

                opacity:
                    0;

                transform:
                    translateY(12px);

            }

            to {

                opacity:
                    1;

                transform:
                    translateY(0);

            }

        }


        .splash-footer {

            position:
                absolute;

            bottom:
                25px;

            left:
                0;

            right:
                0;

            text-align:
                center;

            color:
                #496872;

            font-size:
                7px;

            letter-spacing:
                .20em;

        }

    </style>
    <!-- ================================================
         SIDEBAR
    ================================================= -->

    <aside
        class="sidebar"
        id="sidebar"
    >

        <div class="sidebar-header">

            <div>

                <div class="sidebar-logo">
                    TARSUS
                </div>

                <div class="sidebar-sub">
                    KAI Contact Center 121
                </div>

            </div>


            <button
                type="button"
                class="sidebar-close"
                id="sidebarClose"
            >
                ×
            </button>

        </div>


        <div class="sidebar-user">

            <div class="user-avatar">
                G
            </div>

            <div>

                <strong id="sidebarUserName">
                    Guest User
                </strong>

                <span id="sidebarUserStatus">
                    Belum login
                </span>

            </div>

        </div>


        <nav class="sidebar-nav">


            <button
                type="button"
                class="sidebar-item active"
                data-menu="home"
            >

                <span>⌂</span>
                <strong>Beranda</strong>

            </button>


            <button
                type="button"
                class="sidebar-item"
                data-menu="finder"
            >

                <span>⌕</span>
                <strong>TARSUS Finder</strong>

            </button>


            <button
                type="button"
                class="sidebar-item"
                data-menu="favorite"
            >

                <span>♡</span>
                <strong>Favorit</strong>

            </button>


            <div class="sidebar-divider"></div>


            <button
                type="button"
                class="sidebar-item"
                data-menu="about"
            >

                <span>ⓘ</span>
                <strong>Tentang TARSUS</strong>

            </button>


            <button
                type="button"
                class="sidebar-item"
                data-menu="terms"
            >

                <span>§</span>
                <strong>Syarat & Ketentuan</strong>

            </button>


            <button
                type="button"
                class="sidebar-item"
                data-menu="contact"
            >

                <span>@</span>
                <strong>Hubungi Kami</strong>

            </button>


            <button
                type="button"
                class="sidebar-item"
                data-menu="report"
            >

                <span>!</span>
                <strong>Laporkan Masalah</strong>

            </button>


            <div class="sidebar-divider"></div>


            <button
                type="button"
                class="sidebar-item"
                data-menu="settings"
            >

                <span>⚙</span>
                <strong>Pengaturan</strong>

            </button>

        </nav>


        <div class="sidebar-footer">

            <span>
                TARSUS FINDER
            </span>

            <strong>
                v1.0.0
            </strong>

        </div>

    </aside>
    <style>

        .sidebar {

            position:
                fixed;

            top:
                0;

            left:
                0;

            bottom:
                0;

            z-index:
                300;

            width:
                var(--sidebar-width);

            display:
                flex;

            flex-direction:
                column;

            padding:
                20px 15px;

            background:
                #102b39;

            border-right:
                1px solid
                rgba(220,240,240,.09);

            box-shadow:
                20px 0 70px
                rgba(0,0,0,.25);

            transform:
                translateX(-105%);

            transition:
                transform .3s
                cubic-bezier(.2,.8,.2,1);

        }


        body.light-theme .sidebar {

            background:
                #f8fbfa;

            box-shadow:
                20px 0 70px
                rgba(20,45,55,.12);

        }


        .sidebar.active {

            transform:
                translateX(0);

        }


        .sidebar-header {

            display:
                flex;

            align-items:
                flex-start;

            justify-content:
                space-between;

            padding:
                5px 5px 20px;

        }


        .sidebar-logo {

            color:
                var(--gold);

            font-family:
                Manrope, sans-serif;

            font-size:
                20px;

            font-weight:
                800;

            letter-spacing:
                .12em;

        }


        .sidebar-sub {

            margin-top:
                3px;

            color:
                var(--muted);

            font-size:
                8px;

        }


        .sidebar-close {

            width:
                36px;

            height:
                36px;

            border:
                1px solid
                var(--border);

            border-radius:
                11px;

            color:
                var(--muted);

            background:
                rgba(220,240,240,.035);

            font-size:
                22px;

            cursor:
                pointer;

        }


        .sidebar-user {

            display:
                flex;

            align-items:
                center;

            gap:
                11px;

            padding:
                13px;

            border:
                1px solid
                var(--border);

            border-radius:
                15px;

            background:
                rgba(220,240,240,.025);

        }


        .user-avatar {

            width:
                38px;

            height:
                38px;

            display:
                grid;

            place-items:
                center;

            border-radius:
                12px;

            color:
                #17303b;

            background:
                linear-gradient(
                    135deg,
                    var(--gold),
                    var(--kai-green)
                );

            font-weight:
                800;

        }


        .sidebar-user strong {

            display:
                block;

            color:
                var(--soft);

            font-size:
                11px;

        }


        .sidebar-user span {

            display:
                block;

            margin-top:
                3px;

            color:
                var(--muted);

            font-size:
                8px;

        }


        .sidebar-nav {

            display:
                flex;

            flex-direction:
                column;

            gap:
                4px;

            margin-top:
                20px;

        }


        .sidebar-item {

            width:
                100%;

            display:
                flex;

            align-items:
                center;

            gap:
                12px;

            padding:
                12px;

            border:
                1px solid transparent;

            border-radius:
                12px;

            color:
                var(--muted);

            background:
                transparent;

            text-align:
                left;

            cursor:
                pointer;

            transition:
                .2s ease;

        }


        .sidebar-item span {

            width:
                22px;

            text-align:
                center;

            font-size:
                15px;

        }


        .sidebar-item strong {

            font-size:
                10px;

            font-weight:
                600;

        }


        .sidebar-item:hover,
        .sidebar-item.active {

            color:
                var(--soft);

            border-color:
                rgba(111,183,167,.10);

            background:
                rgba(111,183,167,.07);

        }


        .sidebar-item.active span {

            color:
                var(--gold);

        }


        .sidebar-divider {

            height:
                1px;

            margin:
                8px 4px;

            background:
                var(--border);

        }


        .sidebar-footer {

            display:
                flex;

            justify-content:
                space-between;

            margin-top:
                auto;

            padding:
                15px 5px 3px;

            color:
                var(--muted);

            font-size:
                7px;

            letter-spacing:
                .12em;

        }


        .sidebar-footer strong {

            color:
                var(--gold);

        }


        .sidebar-overlay {

            position:
                fixed;

            inset:
                0;

            z-index:
                250;

            background:
                rgba(2,15,23,.55);

            opacity:
                0;

            visibility:
                hidden;

            transition:
                .25s ease;

        }


        .sidebar-overlay.active {

            opacity:
                1;

            visibility:
                visible;

        }


        @media (max-width: 680px) {

            .sidebar {

                width:
                    min(290px, 86vw);

            }

        }

    </style>
    <!-- ================================================
         MAIN APP
    ================================================= -->

    <main
        class="app"
        id="app"
    >


        <div class="topbar">

            <div class="topbar-left">

                <button
                    type="button"
                    class="menu-button"
                    id="menuButton"
                    aria-label="Buka menu"
                >

                    <span class="menu-icon">

                        <span></span>
                        <span></span>
                        <span></span>

                    </span>

                </button>


                <div>

                    <div class="brand-mini-name">
                        TARSUS
                    </div>

                    <div class="brand-mini-sub">
                        KAI Contact Center 121
                    </div>

                </div>

            </div>


            <div class="version-badge">
                v1.0.0
            </div>

        </div>


        <header class="header">

            <div class="kai-label">
                KAI 121
            </div>

            <h1>
                TARSUS FINDER
            </h1>

            <p class="subtitle">
                Tarif Khusus Perjalanan Kereta Api
            </p>

        </header>


        <section
            class="search-panel"
            id="finderSection"
        >

            <div class="search-heading">

                <div>

                    <span>
                        TARIF KHUSUS
                    </span>

                    <h2>
                        Cari Tarif Perjalanan
                    </h2>

                </div>

                <div class="search-heading-icon">
                    ⌕
                </div>

            </div>


            <div class="route-grid">


                <div class="field">

                    <label>
                        Stasiun Asal
                    </label>

                    <div class="input-wrap">

                        <input
                            id="asal"
                            type="text"
                            autocomplete="off"
                            placeholder="Cari stasiun asal..."
                        >

                        <div
                            id="asal-suggestions"
                            class="suggestions"
                        ></div>

                    </div>

                </div>


                <div class="swap-wrap">

                    <button
                        id="swapBtn"
                        type="button"
                        aria-label="Tukar stasiun"
                    >
                        ⇄
                    </button>

                </div>


                <div class="field">

                    <label>
                        Stasiun Tujuan
                    </label>

                    <div class="input-wrap">

                        <input
                            id="tujuan"
                            type="text"
                            autocomplete="off"
                            placeholder="Cari stasiun tujuan..."
                        >

                        <div
                            id="tujuan-suggestions"
                            class="suggestions"
                        ></div>

                    </div>

                </div>

            </div>


            <button
                id="searchBtn"
                class="search-button"
                type="button"
            >

                <span>
                    ⌕
                </span>

                Temukan Tarif Khusus

            </button>


            <div
                id="status"
                class="status-message"
            ></div>

        </section>
    <style>

        .search-panel {

            padding:
                22px;

            border:
                1px solid var(--border);

            border-radius:
                23px;

            background:
                rgba(18,48,64,.88);

            box-shadow:
                var(--shadow);

            backdrop-filter:
                blur(18px);

        }


        body.light-theme .search-panel {

            background:
                rgba(255,255,255,.90);

        }


        .search-heading {

            display:
                flex;

            align-items:
                center;

            justify-content:
                space-between;

            margin-bottom:
                20px;

        }


        .search-heading span {

            color:
                var(--gold);

            font-size:
                8px;

            font-weight:
                800;

            letter-spacing:
                .17em;

        }


        .search-heading h2 {

            margin-top:
                5px;

            color:
                var(--white);

            font-family:
                Manrope, sans-serif;

            font-size:
                17px;

        }


        .search-heading-icon {

            width:
                40px;

            height:
                40px;

            display:
                grid;

            place-items:
                center;

            border:
                1px solid
                rgba(228,199,131,.15);

            border-radius:
                12px;

            color:
                var(--gold);

        }


        .route-grid {

            display:
                grid;

            grid-template-columns:
                1fr 50px 1fr;

            gap:
                12px;

            align-items:
                end;

        }


        .field {

            position:
                relative;

        }


        .field label {

            display:
                block;

            margin-bottom:
                8px;

            color:
                var(--muted);

            font-size:
                9px;

            font-weight:
                700;

        }


        .input-wrap {

            position:
                relative;

        }


        .input-wrap input {

            width:
                100%;

            height:
                54px;

            padding:
                0 14px;

            outline:
                none;

            border:
                1px solid
                rgba(220,240,240,.12);

            border-radius:
                14px;

            color:
                var(--white);

            background:
                rgba(7,28,40,.65);

            font-size:
                12px;

        }


        body.light-theme .input-wrap input {

            color:
                #17303b;

            background:
                #eef5f4;

        }


        .input-wrap input:focus {

            border-color:
                rgba(111,183,167,.55);

            box-shadow:
                0 0 0 3px
                rgba(111,183,167,.08);

        }


        .input-wrap input::placeholder {

            color:
                #76919a;

        }


        .suggestions {

            position:
                absolute;

            top:
                calc(100% + 7px);

            left:
                0;

            right:
                0;

            z-index:
                100;

            overflow:
                hidden;

            border:
                1px solid var(--border);

            border-radius:
                13px;

            background:
                #123040;

            box-shadow:
                0 18px 40px
                rgba(0,0,0,.30);

        }


        body.light-theme .suggestions {

            background:
                white;

        }


        .suggestion-item {

            padding:
                12px;

            color:
                var(--soft);

            font-size:
                11px;

            border-bottom:
                1px solid var(--border);

            cursor:
                pointer;

        }


        .suggestion-item:last-child {

            border-bottom:
                none;

        }


        .suggestion-item:hover {

            color:
                var(--gold);

            background:
                rgba(111,183,167,.08);

        }


        .swap-wrap {

            display:
                flex;

            justify-content:
                center;

            align-items:
                center;

        }


        #swapBtn {

            width:
                42px;

            height:
                42px;

            border:
                1px solid
                rgba(111,183,167,.25);

            border-radius:
                12px;

            color:
                var(--gold);

            background:
                rgba(111,183,167,.07);

            font-size:
                18px;

            cursor:
                pointer;

            transition:
                .25s ease;

        }


        #swapBtn:hover {

            transform:
                rotate(180deg);

        }


        .search-button {

            width:
                100%;

            height:
                54px;

            margin-top:
                18px;

            border:
                none;

            border-radius:
                14px;

            color:
                #17303b;

            background:
                linear-gradient(
                    105deg,
                    #8bba9a,
                    #e4c783,
                    #70afc1
                );

            font-size:
                10px;

            font-weight:
                800;

            letter-spacing:
                .10em;

            cursor:
                pointer;

        }


        .status-message {

            min-height:
                18px;

            margin-top:
                12px;

            color:
                var(--muted);

            font-size:
                9px;

            text-align:
                center;

        }


        #results {

            margin-top:
                25px;

        }


        @media (max-width: 680px) {

            .route-grid {

                grid-template-columns:
                    1fr;

            }

            .swap-wrap {

                height:
                    0;

                position:
                    relative;

                z-index:
                    5;

            }

            #swapBtn {

                position:
                    absolute;

                right:
                    12px;

                top:
                    -8px;

                width:
                    36px;

                height:
                    36px;

            }

            .search-panel {

                padding:
                    18px;

            }

        }

    </style>
        <!-- ================================================
             QUICK INFO
        ================================================= -->

        <section class="quick-info">

            <div class="quick-card">

                <span>✓</span>

                <div>
                    <strong>
                        Database Terpusat
                    </strong>

                    <small>
                        Data tarif TARSUS
                    </small>
                </div>

            </div>


            <div class="quick-card">

                <span>⚡</span>

                <div>
                    <strong>
                        Pencarian Cepat
                    </strong>

                    <small>
                        Berdasarkan stasiun
                    </small>
                </div>

            </div>


            <div class="quick-card">

                <span>⇄</span>

                <div>
                    <strong>
                        Tarif Alternatif
                    </strong>

                    <small>
                        Relasi tarif tersedia
                    </small>
                </div>

            </div>

        </section>


        <footer class="footer">

            <strong>
                TARSUS FINDER
            </strong>

            <span>
                v1.0.0
            </span>

            <small>
                KAI Contact Center 121
            </small>

        </footer>


    </main>


    <style>

        .quick-info {

            display:
                grid;

            grid-template-columns:
                repeat(3, 1fr);

            gap:
                9px;

            margin-top:
                16px;

        }


        .quick-card {

            display:
                flex;

            align-items:
                center;

            gap:
                8px;

            padding:
                11px;

            border:
                1px solid var(--border);

            border-radius:
                14px;

            background:
                rgba(220,240,240,.025);

        }


        .quick-card > span {

            width:
                29px;

            height:
                29px;

            display:
                grid;

            place-items:
                center;

            flex-shrink:
                0;

            border-radius:
                9px;

            color:
                var(--gold);

            background:
                rgba(228,199,131,.05);

            font-size:
                12px;

        }


        .quick-card strong {

            display:
                block;

            color:
                var(--soft);

            font-size:
                8px;

        }


        .quick-card small {

            display:
                block;

            margin-top:
                3px;

            color:
                var(--muted);

            font-size:
                7px;

        }


        .footer {

            display:
                flex;

            flex-direction:
                column;

            align-items:
                center;

            gap:
                5px;

            padding:
                30px 0 5px;

            text-align:
                center;

        }


        .footer strong {

            color:
                var(--gold);

            font-size:
                9px;

            letter-spacing:
                .16em;

        }


        .footer span {

            color:
                var(--muted);

            font-size:
                7px;

        }


        .footer small {

            color:
                #59727b;

            font-size:
                7px;

        }


        @media (max-width: 680px) {

            .quick-info {

                grid-template-columns:
                    1fr;

            }

        }

    </style>
    <!-- ================================================
         MODAL
    ================================================= -->

    <div
        class="modal-overlay"
        id="modalOverlay"
    ></div>


    <div
        class="info-modal"
        id="infoModal"
    >

        <div class="modal-header">

            <div>

                <span id="modalKicker">
                    TARSUS FINDER
                </span>

                <h2 id="modalTitle">
                    Tentang TARSUS
                </h2>

            </div>


            <button
                type="button"
                id="modalClose"
            >
                ×
            </button>

        </div>


        <div
            class="modal-body"
            id="modalBody"
        ></div>

    </div>


    <!-- ================================================
         MODAL CSS
    ================================================= -->

    <style>

        .modal-overlay {

            position:
                fixed;

            inset:
                0;

            z-index:
                500;

            background:
                rgba(2,15,23,.65);

            opacity:
                0;

            visibility:
                hidden;

            transition:
                .25s ease;

        }


        .modal-overlay.active {

            opacity:
                1;

            visibility:
                visible;

        }


        .info-modal {

            position:
                fixed;

            left:
                50%;

            top:
                50%;

            z-index:
                510;

            width:
                min(580px, calc(100% - 25px));

            max-height:
                calc(100vh - 40px);

            overflow:
                hidden;

            border:
                1px solid var(--border);

            border-radius:
                22px;

            background:
                #102b39;

            box-shadow:
                0 30px 90px
                rgba(0,0,0,.40);

            transform:
                translate(-50%,-48%)
                scale(.97);

            opacity:
                0;

            visibility:
                hidden;

            transition:
                .28s ease;

        }


        body.light-theme .info-modal {

            background:
                #ffffff;

        }


        .info-modal.active {

            transform:
                translate(-50%,-50%)
                scale(1);

            opacity:
                1;

            visibility:
                visible;

        }


        .modal-header {

            display:
                flex;

            align-items:
                flex-start;

            justify-content:
                space-between;

            padding:
                19px;

            border-bottom:
                1px solid var(--border);

        }


        .modal-header span {

            color:
                var(--gold);

            font-size:
                7px;

            font-weight:
                800;

            letter-spacing:
                .18em;

        }


        .modal-header h2 {

            margin-top:
                5px;

            color:
                var(--white);

            font-family:
                Manrope, sans-serif;

            font-size:
                19px;

        }


        #modalClose {

            width:
                36px;

            height:
                36px;

            border:
                1px solid var(--border);

            border-radius:
                10px;

            color:
                var(--muted);

            background:
                transparent;

            font-size:
                22px;

            cursor:
                pointer;

        }


        .modal-body {

            max-height:
                calc(100vh - 130px);

            overflow-y:
                auto;

            padding:
                19px;

        }


        .modal-body h3 {

            margin:
                15px 0 6px;

            color:
                var(--soft);

            font-size:
                12px;

        }


        .modal-body h3:first-child {

            margin-top:
                0;

        }


        .modal-body p {

            color:
                var(--muted);

            font-size:
                10px;

            line-height:
                1.7;

        }


        .modal-body .setting-row {

            display:
                flex;

            align-items:
                center;

            justify-content:
                space-between;

            gap:
                15px;

            padding:
                14px 0;

            border-bottom:
                1px solid var(--border);

        }


        .setting-row strong {

            color:
                var(--soft);

            font-size:
                11px;

        }


        .theme-buttons {

            display:
                flex;

            gap:
                6px;

        }


        .theme-button {

            padding:
                8px 10px;

            border:
                1px solid var(--border);

            border-radius:
                9px;

            color:
                var(--muted);

            background:
                transparent;

            font-size:
                8px;

            cursor:
                pointer;

        }


        .theme-button.active {

            color:
                #17303b;

            border-color:
                transparent;

            background:
                var(--gold);

        }


        .login-button {

            width:
                100%;

            height:
                48px;

            margin-top:
                15px;

            border:
                none;

            border-radius:
                12px;

            color:
                #17303b;

            background:
                linear-gradient(
                    105deg,
                    #8bba9a,
                    #e4c783
                );

            font-size:
                10px;

            font-weight:
                800;

            cursor:
                pointer;

        }

    </style>
    <!-- ================================================
         APPLICATION JAVASCRIPT
    ================================================= -->

    <script>

        const sidebar =
            document.getElementById("sidebar");

        const sidebarOverlay =
            document.getElementById("sidebarOverlay");

        const menuButton =
            document.getElementById("menuButton");

        const sidebarClose =
            document.getElementById("sidebarClose");

        const modal =
            document.getElementById("infoModal");

        const modalOverlay =
            document.getElementById("modalOverlay");

        const modalClose =
            document.getElementById("modalClose");

        const modalTitle =
            document.getElementById("modalTitle");

        const modalBody =
            document.getElementById("modalBody");

        const splash =
            document.getElementById("splash");


        /* ================================================
           SIDEBAR
        ================================================= */

        function openSidebar() {

            sidebar.classList.add("active");

            sidebarOverlay.classList.add("active");

            menuButton.setAttribute(
                "aria-expanded",
                "true"
            );

        }


        function closeSidebar() {

            sidebar.classList.remove("active");

            sidebarOverlay.classList.remove("active");

            menuButton.setAttribute(
                "aria-expanded",
                "false"
            );

        }


        menuButton.addEventListener(
            "click",
            openSidebar
        );


        sidebarClose.addEventListener(
            "click",
            closeSidebar
        );


        sidebarOverlay.addEventListener(
            "click",
            closeSidebar
        );


        /* ================================================
           MODAL
        ================================================= */

        function openModal(title, content) {

            modalTitle.textContent =
                title;

            modalBody.innerHTML =
                content;

            modal.classList.add("active");

            modalOverlay.classList.add("active");

        }


        function closeModal() {

            modal.classList.remove("active");

            modalOverlay.classList.remove("active");

        }


        modalClose.addEventListener(
            "click",
            closeModal
        );


        modalOverlay.addEventListener(
            "click",
            closeModal
        );


        /* ================================================
           SIDEBAR MENU
        ================================================= */

        document
            .querySelectorAll(".sidebar-item")
            .forEach(item => {

                item.addEventListener(
                    "click",
                    () => {

                        document
                            .querySelectorAll(
                                ".sidebar-item"
                            )
                            .forEach(
                                x =>
                                    x.classList.remove(
                                        "active"
                                    )
                            );

                        item.classList.add(
                            "active"
                        );

                        const menu =
                            item.dataset.menu;

                        closeSidebar();


                        if (menu === "home") {

                            window.scrollTo({
                                top: 0,
                                behavior: "smooth"
                            });

                        }


                        if (menu === "finder") {

                            document
                                .getElementById(
                                    "finderSection"
                                )
                                .scrollIntoView({
                                    behavior:
                                        "smooth"
                                });

                        }


                        if (menu === "about") {

                            openModal(
                                "Tentang TARSUS",
                                `
                                <h3>TARSUS Finder</h3>

                                <p>
                                TARSUS Finder merupakan
                                aplikasi pencarian informasi
                                tarif khusus perjalanan kereta
                                api yang dirancang agar proses
                                pencarian menjadi lebih cepat
                                dan praktis.
                                </p>

                                <h3>Versi</h3>

                                <p>
                                v1.0.0
                                </p>
                                `
                            );

                        }


                        if (menu === "terms") {

                            openModal(
                                "Syarat & Ketentuan",
                                `
                                <h3>Penggunaan</h3>

                                <p>
                                TARSUS Finder digunakan sebagai
                                alat bantu pencarian informasi
                                tarif khusus perjalanan kereta
                                api.
                                </p>

                                <h3>Verifikasi Informasi</h3>

                                <p>
                                Informasi yang ditampilkan
                                sebaiknya tetap diverifikasi
                                dengan sumber resmi yang berlaku
                                sebelum digunakan untuk kebutuhan
                                pelayanan atau transaksi.
                                </p>

                                <h3>Pembaruan</h3>

                                <p>
                                Data dan sistem aplikasi dapat
                                diperbarui sewaktu-waktu.
                                </p>
                                `
                            );

                        }


                        if (menu === "contact") {

                            openModal(
                                "Hubungi Kami",
                                `
                                <h3>Email</h3>

                                <p>
                                primaadis46@gmail.com
                                </p>

                                <h3>Support</h3>

                                <p>
                                Sampaikan pertanyaan,
                                koreksi data, atau masukan
                                melalui kanal kontak yang
                                tersedia.
                                </p>
                                `
                            );

                        }


                        if (menu === "report") {

                            openModal(
                                "Laporkan Masalah",
                                `
                                <h3>Temukan masalah?</h3>

                                <p>
                                Sampaikan detail kesalahan
                                data, masalah aplikasi,
                                atau saran pengembangan
                                melalui email support.
                                </p>

                                <button
                                    class="login-button"
                                    onclick="window.location.href='mailto:primaadis46@gmail.com?subject=Laporan%20TARSUS%20Finder'"
                                >
                                    Kirim Laporan
                                </button>
                                `
                            );

                        }


                        if (menu === "favorite") {

                            openModal(
                                "Favorit",
                                `
                                <h3>Belum tersedia</h3>

                                <p>
                                Fitur favorit akan tersedia
                                pada pengembangan berikutnya.
                                </p>
                                `
                            );

                        }


                        if (menu === "settings") {

                            openModal(
                                "Pengaturan",
                                `
                                <div class="setting-row">

                                    <div>

                                        <strong>
                                            Tema aplikasi
                                        </strong>

                                    </div>

                                    <div
                                        class="theme-buttons"
                                    >

                                        <button
                                            class="theme-button"
                                            data-theme="light"
                                        >
                                            Light
                                        </button>

                                        <button
                                            class="theme-button"
                                            data-theme="dark"
                                        >
                                            Dark
                                        </button>

                                        <button
                                            class="theme-button"
                                            data-theme="system"
                                        >
                                            System
                                        </button>

                                    </div>

                                </div>

                                <h3>Versi aplikasi</h3>

                                <p>
                                TARSUS Finder v1.0.0
                                </p>
                                `
                            );

                            updateThemeButtons();

                        }

                    }
                );

            });


        /* ================================================
           THEME
        ================================================= */

        function systemTheme() {

            return window.matchMedia(
                "(prefers-color-scheme: light)"
            ).matches
                ? "light"
                : "dark";

        }


        function applyTheme(theme) {

            let actualTheme =
                theme === "system"
                    ? systemTheme()
                    : theme;

            document.body.classList.toggle(
                "light-theme",
                actualTheme === "light"
            );


            document
                .getElementById(
                    "themeColorMeta"
                )
                .setAttribute(
                    "content",
                    actualTheme === "light"
                        ? "#f5f9f8"
                        : "#102536"
                );


            localStorage.setItem(
                "tarsus-theme",
                theme
            );

            updateThemeButtons();

        }


        function updateThemeButtons() {

            const saved =
                localStorage.getItem(
                    "tarsus-theme"
                ) || "system";


            document
                .querySelectorAll(
                    ".theme-button"
                )
                .forEach(button => {

                    button.classList.toggle(
                        "active",
                        button.dataset.theme === saved
                    );

                    button.onclick = () => {

                        applyTheme(
                            button.dataset.theme
                        );

                    };

                });

        }


        applyTheme(
            localStorage.getItem(
                "tarsus-theme"
            ) || "system"
        );


        window
            .matchMedia(
                "(prefers-color-scheme: light)"
            )
            .addEventListener(
                "change",
                () => {

                    const saved =
                        localStorage.getItem(
                            "tarsus-theme"
                        );

                    if (saved === "system") {

                        applyTheme("system");

                    }

                }
            );


        /* ================================================
           ESCAPE
        ================================================= */

        document.addEventListener(
            "keydown",
            event => {

                if (event.key === "Escape") {

                    closeSidebar();

                    closeModal();

                }

            }
        );


        /* ================================================
           SPLASH
        ================================================= */

        window.addEventListener(
            "load",
            () => {

                setTimeout(
                    () => {

                        if (splash) {

                            splash.classList.add(
                                "hidden"
                            );

                        }

                    },
                    700
                );

            }
        );

    </script>


    <!-- ================================================
         DATA ENGINE
    ================================================= -->

    <script src="data.js"></script>


    <!-- ================================================
         SERVICE WORKER
    ================================================= -->

    <script>

        if ("serviceWorker" in navigator) {

            window.addEventListener(
                "load",
                () => {

                    navigator
                        .serviceWorker
                        .register(
                            "/tarsus-backup/sw.js"
                        )
                        .then(
                            registration => {

                                console.log(
                                    "TARSUS Service Worker aktif:",
                                    registration.scope
                                );

                            }
                        )
                        .catch(
                            error => {

                                console.error(
                                    "TARSUS Service Worker gagal:",
                                    error
                                );

                            }
                        );

                }
            );

        }

    </script>


</body>

</html>
