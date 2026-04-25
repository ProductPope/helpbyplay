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
        'game_minesweeper_name'=> 'Saper',
        'game_flappy_name'     => 'Flappy Bird',

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
        'game_minesweeper_name'=> 'Minesweeper',
        'game_flappy_name'     => 'Flappy Bird',

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
