<?php
// Requires config.php and lang.php loaded before calling.

function render_ad_slot(): void {
    $provider = defined('AD_PROVIDER') ? AD_PROVIDER : '';
?>
<!-- ADSENSE_PLACEHOLDER -->
<div class="ad-wrapper">
<?php if ($provider === 'adsense' && defined('ADSENSE_CLIENT') && ADSENSE_CLIENT !== '' && defined('ADSENSE_SLOT') && ADSENSE_SLOT !== ''): ?>
    <ins class="adsbygoogle"
         style="display:none;width:100%"
         data-ad-client="<?= htmlspecialchars(ADSENSE_CLIENT) ?>"
         data-ad-slot="<?= htmlspecialchars(ADSENSE_SLOT) ?>"
         data-ad-format="auto"
         data-full-width-responsive="true"></ins>
    <div class="ad-placeholder" id="hbp-ad-fallback" style="display:none">
        <span class="ad-placeholder-icon">📢</span>
        <span class="ad-placeholder-text"><?= t('ad_placeholder') ?></span>
    </div>
    <script>(function(){
        if(localStorage.getItem('hbp_cookie_consent')!=='accepted')return;
        var ins=document.querySelector('ins.adsbygoogle');
        if(!ins)return;
        ins.style.display='block';
        try{(window.adsbygoogle=window.adsbygoogle||[]).push({});}catch(e){}
        setTimeout(function(){
            if(!ins.children.length){ins.style.display='none';var f=document.getElementById('hbp-ad-fallback');if(f)f.style.display='';}
        },2000);
    })();</script>
<?php elseif ($provider === 'custom'): ?>
    <div class="ad-slot-mobile ad-custom-slot" style="display:none"><?= defined('AD_CUSTOM_HTML_MOBILE') ? AD_CUSTOM_HTML_MOBILE : '' ?></div>
    <div class="ad-slot-desktop ad-custom-slot" style="display:none"><?= defined('AD_CUSTOM_HTML_DESKTOP') ? AD_CUSTOM_HTML_DESKTOP : '' ?></div>
    <script>(function(){
        if(localStorage.getItem('hbp_cookie_consent')!=='accepted')return;
        document.querySelectorAll('.ad-custom-slot').forEach(function(el){el.style.display='';});
    })();</script>
<?php else: ?>
    <div class="ad-placeholder">
        <span class="ad-placeholder-icon">📢</span>
        <span class="ad-placeholder-text"><?= t('ad_placeholder') ?></span>
    </div>
<?php endif; ?>
</div>
<?php
}
