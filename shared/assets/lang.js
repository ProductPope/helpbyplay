// Language switcher — sets cookie and reloads page.
function switchLang(lang) {
    if (lang !== 'pl' && lang !== 'en') return;
    document.cookie = 'lang=' + lang + '; path=/; max-age=31536000; SameSite=Lax';
    location.reload();
}
