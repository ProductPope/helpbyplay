<?php
// All user-visible strings. Access via t('key').
// Never hardcode Polish or English strings outside this file.

$TRANSLATIONS = [
    'pl' => [
        // Site-wide
        'site_title'           => 'Help By Play',
        'lang_pl'              => 'PL',
        'lang_en'              => 'EN',

        // Index screen
        'global_counter_label' => 'Łącznie zebrano dla fundacji',
        'sessions_label'       => 'graczy już pomogło',
        'btn_play'             => 'Zagraj i pomóż',
        'how_it_works_title'   => 'Jak to działa?',
        'how_it_works_1'       => 'Grasz za darmo',
        'how_it_works_2'       => 'Reklamy finansują fundację',
        'how_it_works_3'       => 'Razem pomagamy',

        // Stats bar
        'stat_players'         => 'graczy',
        'stat_raised'          => 'zebrano',

        // Game selector (index)
        'games_section_title'  => 'Wybierz grę',
        'btn_play_game'        => 'Zagraj',
        'coming_soon'          => 'Wkrótce',
        'game_cards_name'      => 'Łącz i pomagaj',
        'game_cards_desc'      => 'Klasyczna gra match-3. Łącz kolorowe symbole i pomagaj fundacji.',
        'game_2048_name'           => '2048',
        'game_2048_desc'           => 'Łącz kafelki i dobierz się do 2048!',
        'game_2048_gameover_title' => 'Koniec gry',
        'game_2048_win_badge'      => 'Osiągnąłeś 2048! 🎉',
        'tutorial_2048'            => 'Przesuń kafelki palcem lub strzałkami. Łącz jednakowe liczby. Dobierz się do 2048!',
        'tutorial_2048_btn'        => 'Rozumiem',
        'game_snake_name'          => 'Wąż',
        'game_snake_desc'          => 'Klasyczny wąż w stylu retro. Jedz, rośnij, nie wpadnij w ogon!',
        'tutorial_snake'           => 'Steruj strzałkami lub WASD. Na mobile przesuń palcem. Nie wpadaj we własny ogon!',
        'tutorial_snake_btn'       => 'START',
        'game_memory_name'     => 'Memory',
        'game_memory_desc'     => 'Klasyczna gra pamięciowa. Znajdź wszystkie pary ukrytych symboli!',
        'tutorial_memory'      => 'Odkryj dwie pasujące karty. Zapamiętaj gdzie są ukryte symbole. Znajdź wszystkie pary!',
        'tutorial_memory_btn'  => 'START',
        'memory_moves'         => 'Ruchy',
        'memory_pairs'         => 'Pary',
        'memory_bonus'         => 'Bonus +20% za mało ruchów!',
        'game_minesweeper_name'=> 'Saper',
        'game_saper_name'      => 'Saper',
        'game_saper_desc'      => 'Klasyczny saper. Odkryj pole minowe bez wpadnięcia na minę!',
        'game_platformer_name' => 'Platformer',
        'game_platformer_desc' => 'Lekarz kontra wirusy! Zbieraj jedzenie i ratuj świat!',
        'tutorial_platformer'  => 'Biegnij, skacz, zbieraj monety! Unikaj wrogów lub skacz na nich z góry.',
        'tutorial_platformer_hint' => 'Desktop: strzałki / WASD + spacja. Mobile: przyciski poniżej.',
        'tutorial_platformer_btn'  => 'START',
        'tutorial_saper'       => 'Kliknij, by odkryć pole. Przytrzymaj 0,5 s lub kliknij prawym przyciskiem, by postawić flagę. Pierwsze kliknięcie jest zawsze bezpieczne!',
        'tutorial_saper_btn'   => 'Rozumiem',
        'saper_win'            => 'Pole rozminowane! 🎉',
        'saper_lose'           => 'Boom! Trafiłeś na minę.',
        'saper_time'           => 'Czas',
        'saper_best'           => 'Rekord',
        'game_arkanoid_name'   => 'Arkanoid',
        'game_arkanoid_desc'   => 'Rozbij wszystkie cegły!',
        'game_flappy_name'     => 'Flappy Bird',
        'game_jumper_name'     => 'Skoczek',
        'game_jumper_desc'     => 'Skacz coraz wyżej i bij rekordy!',
        'tutorial_jumper'      => 'Skacz w górę! Steruj kierunkiem lewo i prawo. Im wyżej tym lepiej!',
        'tutorial_jumper_btn'  => 'START',
        'game_invaders_name'   => 'Najeźdźcy',
        'game_invaders_desc'   => 'Klasyczna strzelanka kosmiczna. Zniszcz wszystkich najeźdźców!',
        'tutorial_invaders'    => 'Zniszcz wszystkich kosmitów! Unikaj ich pocisków i chroń się za schronami.',
        'tutorial_invaders_btn'=> 'START',

        // Game screen
        'game_title'           => 'Graj i pomagaj!',
        'game_story'           => 'Pomysł ma ponad 11 lat. Gry online, reklamy, fundacje — byliśmy blisko. Zabrakło reklamodawcy, projekt upadł. Kwiecień 2026: AI zmienił zasady. AdSense płaci bezpośrednio fundacji — bez pośrednika. Help By Play wraca, tym razem inaczej.',
        'session_earned_label' => 'Twoja sesja zebrała',

        // Summary screen
        'summary_title'        => 'Dziękujemy za pomoc!',
        'summary_duration'     => 'Czas gry',
        'summary_earned'       => 'Zebrałeś/aś dla fundacji',
        'summary_global'       => 'Łączna kwota zebrana dla fundacji',
        'summary_thanks_msg'   => 'Każda sekunda gry ma znaczenie. Wróć jutro i graj znowu!',
        'btn_play_again'       => 'Zagraj jeszcze raz',
        'btn_back_home'        => 'Strona główna',

        // Units
        'seconds_short'        => 's',
        'minutes_short'        => 'min',
        'currency'             => 'PLN',

        // Errors
        'error_session'        => 'Błąd połączenia z serwerem. Odśwież stronę.',

        // Inactivity screen
        'inactivity_title'     => 'Sesja zakończona',
        'inactivity_msg'       => 'Brak aktywności przez 10 minut. Twój czas gry został zapisany.',

        // Score & restart
        'score_label'          => 'Wynik',
        'highscore_label'      => 'Rekord',
        'new_record'           => 'Nowy rekord!',
        'btn_restart'          => 'Nowa plansza',

        // Ad placeholder
        'ad_placeholder'       => 'Tu pojawi się reklama Google AdSense',

        // About blurb
        'about_text'           => 'Help By Play to inicjatywa społecznościowa która łączy granie z pomaganiem. Grasz bezpłatnie, wyświetlają się reklamy, przychód trafia bezpośrednio na konto tej fundacji przez Google AdSense. Projekt jest open source — kod jest publiczny i każdy może sprawdzić jak działa.',
        'about_link'           => 'Więcej o projekcie →',

        // Header stats
        'header_stats'         => 'graczy zebrało',

        // Footer
        'footer_opensource'    => 'HelpByPlay to projekt open source.',
        'footer_about_link'    => 'O projekcie',

        // Ad wait message
        'ad_wait_msg'          => 'Oczekiwanie na reklamę',

        // Foundation banner & game page section
        'playing_for'          => 'Grasz dla:',

        // NGO recommendation section
        'recommend_title'      => 'Poleć projekt swojej fundacji',
        'recommend_text'       => 'Każda organizacja pozarządowa może dołączyć do Help By Play i otrzymać własną stronę z grami. Przychody z reklam Google AdSense trafiają bezpośrednio na konto fundacji. Zero prowizji, zero kosztów.',
        'recommend_link'       => 'Dowiedz się więcej na helpbyplay.com',

        // Game page footer note
        'ad_value_note'        => 'Szacunkowa wartość wyświetleń reklamowych.',

        // Footer disclaimer
        'footer_ad_note'       => 'Kwota zebranych środków jest szacunkowa i zależy od aktualnych stawek Google AdSense.',

        // SEO game info section
        'how_to_play'              => 'Jak grać?',
        'game_memory_about'        => 'Klasyczna gra pamięciowa ze zwierzętami. Odkrywaj karty i znajdź wszystkie pasujące pary. Im mniej ruchów tym lepszy wynik.',
        'game_memory_tutorial'     => 'Dotknij kartę aby ją odkryć. Odkryj dwie jednakowe karty aby je dopasować. Zapamiętaj pozycje odkrytych kart. Znajdź wszystkie pary w jak najkrótszym czasie!',
        'game_cards_about'         => 'Klasyczna gra match-3 z symbolami kart. Łącz grupy trzech lub więcej jednakowych symboli aby je usunąć i zdobywać punkty.',
        'game_cards_tutorial'      => 'Kliknij lub dotknij grupę trzech lub więcej jednakowych symboli aby je usunąć. Im większa grupa tym więcej punktów. Gra nie ma końca — bij rekordy!',
        'game_2048_about'          => 'Kultowa gra logiczna. Przesuwaj kafelki i łącz jednakowe liczby aby dotrzeć do magicznego kafelka 2048.',
        'game_2048_tutorial'       => 'Przesuń wszystkie kafelki w jednym kierunku. Dwa kafelki o tej samej wartości łączą się w jeden. Dobierz się do liczby 2048!',
        'game_snake_about'         => 'Klasyczny wąż w stylu retro. Zbieraj jabłka, rośnij i nie wpadaj we własny ogon.',
        'game_snake_tutorial'      => 'Przesuń palcem w dowolnym kierunku aby zmienić kierunek węża. Zbieraj czerwone jabłka. Gra kończy się gdy wąż ugryzie własny ogon.',
        'game_saper_about'         => 'Klasyczny saper wymagający logicznego myślenia. Odkrywaj bezpieczne pola i znajdź wszystkie miny bez eksplozji.',
        'game_saper_tutorial'      => 'Kliknij aby odkryć pole. Przytrzymaj aby postawić flagę na minie. Cyfry pokazują ile min sąsiaduje z polem.',
        'game_platformer_about'    => 'Retro platformówka z lekarzem jako bohaterem. Skacz po platformach, zbieraj pizzę i unikaj wirusów.',
        'game_platformer_tutorial' => 'Przyciski lewo i prawo sterują ruchem. Przycisk skoku lub tap po prawej stronie skacze. Zbieraj pizzę i unikaj czerwonych wirusów.',
        'game_jumper_about'        => 'Skacz coraz wyżej i bij rekordy wysokości. Im wyżej wejdziesz tym więcej punktów zdobywasz.',
        'game_jumper_tutorial'     => 'Używaj przycisków lewo i prawo aby kierować skoczkiem. Ląduj na platformach i skacz wyżej. Upadek na dół kończy grę.',
        'game_invaders_about'      => 'Klasyczna strzelanka kosmiczna. Zniszcz wszystkich najeźdźców zanim Cię zestrzelą.',
        'game_invaders_tutorial'   => 'Poruszaj statkiem przyciskami lewo prawo. Przycisk strzału niszczy kosmitów. Unikaj ich pocisków. Zestrzelenie całego rzędu dodaje nowy.',
    ],

    'en' => [
        // Site-wide
        'site_title'           => 'Help By Play',
        'lang_pl'              => 'PL',
        'lang_en'              => 'EN',

        // Index screen
        'global_counter_label' => 'Total raised for the charity',
        'sessions_label'       => 'players already helped',
        'btn_play'             => 'Play and help',
        'how_it_works_title'   => 'How does it work?',
        'how_it_works_1'       => 'You play for free',
        'how_it_works_2'       => 'Ads fund the charity',
        'how_it_works_3'       => 'Together we help',

        // Stats bar
        'stat_players'         => 'players',
        'stat_raised'          => 'raised',

        // Game selector (index)
        'games_section_title'  => 'Choose a game',
        'btn_play_game'        => 'Play',
        'coming_soon'          => 'Coming soon',
        'game_cards_name'      => 'Match & Help',
        'game_cards_desc'      => 'Classic match-3 game. Match colorful symbols and help the charity.',
        'game_2048_name'           => '2048',
        'game_2048_desc'           => 'Merge tiles and reach 2048!',
        'game_2048_gameover_title' => 'Game Over',
        'game_2048_win_badge'      => 'You reached 2048! 🎉',
        'tutorial_2048'            => 'Swipe or use arrow keys. Merge matching tiles. Reach 2048!',
        'tutorial_2048_btn'        => 'Got it',
        'game_snake_name'          => 'Snake',
        'game_snake_desc'          => 'Classic retro snake. Eat, grow, don\'t bite your tail!',
        'tutorial_snake'           => 'Use arrow keys or WASD. On mobile, swipe. Don\'t bite your own tail!',
        'tutorial_snake_btn'       => 'START',
        'game_memory_name'     => 'Memory',
        'game_memory_desc'     => 'Classic memory game. Find all pairs of hidden symbols!',
        'tutorial_memory'      => 'Flip two matching cards. Remember where the symbols are hidden. Find all pairs!',
        'tutorial_memory_btn'  => 'START',
        'memory_moves'         => 'Moves',
        'memory_pairs'         => 'Pairs',
        'memory_bonus'         => 'Bonus +20% for few moves!',
        'game_minesweeper_name'=> 'Minesweeper',
        'game_saper_name'      => 'Minesweeper',
        'game_saper_desc'      => 'Classic minesweeper. Clear the minefield without hitting a mine!',
        'game_platformer_name' => 'Platformer',
        'game_platformer_desc' => 'Doctor vs viruses! Collect food and save the world!',
        'tutorial_platformer'  => 'Run, jump, collect coins! Avoid enemies or jump on them from above.',
        'tutorial_platformer_hint' => 'Desktop: arrow keys / WASD + space. Mobile: buttons below.',
        'tutorial_platformer_btn'  => 'START',
        'tutorial_saper'       => 'Tap to reveal a cell. Hold 0.5 s or right-click to place a flag. First click is always safe!',
        'tutorial_saper_btn'   => 'Got it',
        'saper_win'            => 'Minefield cleared! 🎉',
        'saper_lose'           => 'Boom! You hit a mine.',
        'saper_time'           => 'Time',
        'saper_best'           => 'Best',
        'game_arkanoid_name'   => 'Arkanoid',
        'game_arkanoid_desc'   => 'Break all the bricks!',
        'game_flappy_name'     => 'Flappy Bird',
        'game_jumper_name'     => 'Jumper',
        'game_jumper_desc'     => 'Jump higher and higher and beat your record!',
        'tutorial_jumper'      => 'Jump up! Control left and right direction. The higher the better!',
        'tutorial_jumper_btn'  => 'START',
        'game_invaders_name'   => 'Invaders',
        'game_invaders_desc'   => 'Classic space shooter. Destroy all invaders!',
        'tutorial_invaders'    => 'Destroy all invaders! Dodge their shots and hide behind shields.',
        'tutorial_invaders_btn'=> 'START',

        // Game screen
        'game_title'           => 'Play and help!',
        'game_story'           => 'The idea is over 11 years old. Online games, ads, charities — we were close. Advertisers never came. The project died. April 2026: AI changed the rules. AdSense pays the charity directly — no middleman. Help By Play is back, this time differently.',
        'session_earned_label' => 'Your session raised',

        // Summary screen
        'summary_title'        => 'Thank you for helping!',
        'summary_duration'     => 'Play time',
        'summary_earned'       => 'You raised for the charity',
        'summary_global'       => 'Total raised for the charity',
        'summary_thanks_msg'   => 'Every second of play matters. Come back tomorrow and play again!',
        'btn_play_again'       => 'Play again',
        'btn_back_home'        => 'Home page',

        // Units
        'seconds_short'        => 's',
        'minutes_short'        => 'min',
        'currency'             => 'PLN',

        // Errors
        'error_session'        => 'Server connection error. Please refresh the page.',

        // Inactivity screen
        'inactivity_title'     => 'Session ended',
        'inactivity_msg'       => 'No activity for 10 minutes. Your play time has been saved.',

        // Score & restart
        'score_label'          => 'Score',
        'highscore_label'      => 'Best',
        'new_record'           => 'New record!',
        'btn_restart'          => 'New board',

        // Ad placeholder
        'ad_placeholder'       => 'Google AdSense ad will appear here',

        // About blurb
        'about_text'           => 'Help By Play is a community initiative that connects gaming with helping others. You play for free, ads are displayed, and the revenue goes directly to this charity\'s account via Google AdSense. The project is open source — the code is public and anyone can see how it works.',
        'about_link'           => 'More about the project →',

        // Header stats
        'header_stats'         => 'players raised',

        // Footer
        'footer_opensource'    => 'HelpByPlay is an open source project.',
        'footer_about_link'    => 'About the project',

        // Ad wait message
        'ad_wait_msg'          => 'Waiting for ad',

        // Foundation banner & game page section
        'playing_for'          => 'Playing for:',

        // NGO recommendation section
        'recommend_title'      => 'Recommend this project to your NGO',
        'recommend_text'       => 'Any non-profit organisation can join Help By Play and get their own gaming page. Google AdSense revenue goes directly to the foundation\'s account. Zero commission, zero costs.',
        'recommend_link'       => 'Learn more at helpbyplay.com',

        // Game page footer note
        'ad_value_note'        => 'Estimated ad impression value.',

        // Footer disclaimer
        'footer_ad_note'       => 'The amount collected is an estimate based on current Google AdSense rates.',

        // SEO game info section
        'how_to_play'              => 'How to play?',
        'game_memory_about'        => 'Classic memory game with animals. Flip cards and find all matching pairs. Fewer moves means a better score.',
        'game_memory_tutorial'     => 'Tap a card to flip it. Flip two matching cards to pair them. Remember the positions of revealed cards. Find all pairs as fast as possible!',
        'game_cards_about'         => 'Classic match-3 game with card symbols. Match groups of three or more identical symbols to remove them and score points.',
        'game_cards_tutorial'      => 'Tap a group of three or more matching symbols to remove them. Bigger groups score more points. The game never ends — beat your record!',
        'game_2048_about'          => 'The iconic puzzle game. Slide tiles and merge matching numbers to reach the magical 2048 tile.',
        'game_2048_tutorial'       => 'Swipe all tiles in one direction. Two tiles with the same number merge into one. Reach the number 2048!',
        'game_snake_about'         => 'Classic retro snake game. Collect apples, grow longer and don\'t bite your own tail.',
        'game_snake_tutorial'      => 'Swipe in any direction to turn the snake. Collect red apples. Game over when the snake bites its own tail.',
        'game_saper_about'         => 'Classic minesweeper requiring logical thinking. Reveal safe cells and find all mines without exploding.',
        'game_saper_tutorial'      => 'Tap to reveal a cell. Hold to place a flag on a mine. Numbers show how many mines are adjacent.',
        'game_platformer_about'    => 'Retro platformer with a doctor as the hero. Jump across platforms, collect pizza and avoid viruses.',
        'game_platformer_tutorial' => 'Left and right buttons control movement. Jump button or tap on the right side jumps. Collect pizza and avoid red viruses.',
        'game_jumper_about'        => 'Jump higher and higher and beat height records. The higher you climb the more points you score.',
        'game_jumper_tutorial'     => 'Use left and right buttons to steer the jumper. Land on platforms and jump higher. Falling to the bottom ends the game.',
        'game_invaders_about'      => 'Classic space shooter. Destroy all invaders before they shoot you down.',
        'game_invaders_tutorial'   => 'Move your ship with left right buttons. Fire button destroys invaders. Dodge their shots. Destroying a full row adds a new one.',
    ],
];

function t(string $key): string {
    global $TRANSLATIONS, $LANG;
    return $TRANSLATIONS[$LANG][$key] ?? $TRANSLATIONS['pl'][$key] ?? $key;
}

function get_lang(): string {
    if (isset($_COOKIE['lang']) && in_array($_COOKIE['lang'], ['pl', 'en'], true)) {
        return $_COOKIE['lang'];
    }
    if (defined('DEFAULT_LANG') && in_array(DEFAULT_LANG, ['pl', 'en'], true)) {
        return DEFAULT_LANG;
    }
    return 'pl';
}
