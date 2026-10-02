<?php
// Repository consistency checks — run by CI and locally: php .github/scripts/check.php
// 1. PL and EN translation keys match
// 2. Every literal t('key') used in PHP exists in lang.php
// 3. No Polish characters outside lang.php (project language rule)

$root   = dirname(__DIR__, 2);
$errors = [];

$LANG = 'pl';
require $root . '/lang.php';

$pl = array_keys($TRANSLATIONS['pl']);
$en = array_keys($TRANSLATIONS['en']);
foreach (array_diff($pl, $en) as $k) $errors[] = "lang.php: key '$k' missing in en";
foreach (array_diff($en, $pl) as $k) $errors[] = "lang.php: key '$k' missing in pl";

$files = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($root, FilesystemIterator::SKIP_DOTS));
foreach ($files as $file) {
    $path = $file->getPathname();
    $rel  = substr($path, strlen($root) + 1);
    if (str_starts_with($rel, '.git/') || $rel === 'config.php' || $rel === '.github/scripts/check.php') continue;
    if (!preg_match('/\.(php|js|css|md|sql)$/', $rel)) continue;

    $src = file_get_contents($path);

    if (str_ends_with($rel, '.php') && $rel !== 'lang.php' && preg_match_all("/\\bt\\('([a-z0-9_]+)'\\)/", $src, $m)) {
        foreach (array_unique($m[1]) as $k) {
            if (!isset($TRANSLATIONS['pl'][$k])) $errors[] = "$rel: unknown translation key '$k'";
        }
    }

    if ($rel !== 'lang.php') {
        foreach (explode("\n", $src) as $i => $line) {
            // "złoty" is the English name of the currency — allowed in docs
            if (preg_match('/[ąćęłńóśźżĄĆĘŁŃÓŚŹŻ]/u', str_replace('złoty', '', $line))) {
                $errors[] = "$rel:" . ($i + 1) . ': Polish text outside lang.php';
            }
        }
    }
}

if ($errors) {
    fwrite(STDERR, implode("\n", $errors) . "\n");
    exit(1);
}
echo "All checks passed\n";
