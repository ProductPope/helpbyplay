(function () {
    var CONSENT_KEY = 'hbp_cookie_consent';

    function getConsent() {
        try { return localStorage.getItem(CONSENT_KEY); } catch (e) { return null; }
    }

    function setConsent(val) {
        try { localStorage.setItem(CONSENT_KEY, val); } catch (e) {}
    }

    function hideAds() {
        document.querySelectorAll('ins.adsbygoogle').forEach(function (ins) {
            ins.style.display = 'none';
        });
    }

    function pushAds() {
        document.querySelectorAll('ins.adsbygoogle').forEach(function (ins) {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
        });
    }

    function hideBanner(banner) {
        banner.style.transition = 'opacity 0.3s';
        banner.style.opacity = '0';
        setTimeout(function () { banner.style.display = 'none'; }, 300);
    }

    function injectStyles() {
        var style = document.createElement('style');
        style.textContent =
            '#hbp-cookie-banner{position:fixed;bottom:0;left:0;right:0;background:#fff;' +
            'box-shadow:0 -2px 8px rgba(0,0,0,.15);padding:16px 24px;z-index:9999;}' +
            '#hbp-cookie-inner{display:flex;flex-direction:column;gap:12px;' +
            'max-width:1200px;margin:0 auto;}' +
            '#hbp-cookie-text{margin:0;font-size:14px;line-height:1.5;color:#212121;}' +
            '#hbp-cookie-text a{color:#2E7D32;text-decoration:underline;}' +
            '#hbp-cookie-buttons{display:flex;flex-direction:column;gap:8px;}' +
            '#hbp-cookie-accept{background:#2E7D32;color:#fff;border:none;padding:12px 24px;' +
            'border-radius:8px;font-size:14px;cursor:pointer;min-height:48px;width:100%;}' +
            '#hbp-cookie-decline{background:transparent;color:#2E7D32;border:2px solid #2E7D32;' +
            'padding:10px 24px;border-radius:8px;font-size:14px;cursor:pointer;min-height:48px;width:100%;}' +
            '@media(min-width:600px){#hbp-cookie-inner{flex-direction:row;align-items:center;}' +
            '#hbp-cookie-text{flex:1;}#hbp-cookie-buttons{flex-direction:row;flex-shrink:0;}' +
            '#hbp-cookie-accept,#hbp-cookie-decline{width:auto;}}';
        document.head.appendChild(style);
    }

    function showBanner() {
        var strings = window.HBP_CONSENT_STRINGS || {};

        injectStyles();

        var banner = document.createElement('div');
        banner.id = 'hbp-cookie-banner';
        banner.setAttribute('role', 'dialog');
        banner.setAttribute('aria-label', 'Cookie consent');

        var inner = document.createElement('div');
        inner.id = 'hbp-cookie-inner';

        var text = document.createElement('p');
        text.id = 'hbp-cookie-text';
        text.innerHTML = strings.text || '';

        var buttons = document.createElement('div');
        buttons.id = 'hbp-cookie-buttons';

        var btnAccept = document.createElement('button');
        btnAccept.id = 'hbp-cookie-accept';
        btnAccept.textContent = strings.accept || 'Accept';

        var btnDecline = document.createElement('button');
        btnDecline.id = 'hbp-cookie-decline';
        btnDecline.textContent = strings.decline || 'Decline';

        btnAccept.addEventListener('click', function () {
            setConsent('accepted');
            pushAds();
            hideBanner(banner);
        });

        btnDecline.addEventListener('click', function () {
            setConsent('rejected');
            hideAds();
            hideBanner(banner);
        });

        buttons.appendChild(btnAccept);
        buttons.appendChild(btnDecline);
        inner.appendChild(text);
        inner.appendChild(buttons);
        banner.appendChild(inner);
        document.body.appendChild(banner);
    }

    var consent = getConsent();

    if (consent === 'rejected') {
        hideAds();
    } else if (consent !== 'accepted') {
        showBanner();
    }
}());
