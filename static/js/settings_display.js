var settings_display = (function () {

var exports = {};

var meta = {
    loaded: false,
};

function change_display_setting(data, status_element, success_msg) {
    settings_ui.do_settings_change('/json/settings/display', data, status_element, success_msg);
}

exports.set_night_mode = function (bool) {
    var night_mode = bool;
    var data = {night_mode: JSON.stringify(night_mode)};
    change_display_setting(data, '#display-settings-status');
};

exports.set_up = function () {
    meta.loaded = true;
    $("#display-settings-status").hide();

    $("#user_timezone").val(page_params.timezone);
    $(".emojiset_choice[value=" + page_params.emojiset + "]").prop("checked", true);

    $("#default_language_modal [data-dismiss]").click(function () {
        overlays.close_modal('default_language_modal');
    });

    $("#default_language_modal .language").click(function (e) {
        e.preventDefault();
        e.stopPropagation();
        overlays.close_modal('default_language_modal');

        var data = {};
        var $link = $(e.target).closest("a[data-code]");
        var setting_value = $link.attr('data-code');
        data.default_language = JSON.stringify(setting_value);

        var new_language = $link.attr('data-name');
        $('#default_language_name').text(new_language);

        change_display_setting(data, '#language-settings-status',
                               i18n.t("Saved. Please <a class='reload_link'>reload</a> for the change to take effect."));

    });

    $('#default_language').on('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        overlays.open_modal('default_language_modal');
    });

    $("#high_contrast_mode").change(function () {
        var high_contrast_mode = this.checked;
        var data = {};
        data.high_contrast_mode = JSON.stringify(high_contrast_mode);
        change_display_setting(data, '#display-settings-status');
    });

    $("#night_mode").change(function () {
        exports.set_night_mode(this.checked);
    });

    $('body').on('click', '.reload_link', function () {
        window.location.reload();
    });

    $("#left_side_userlist").change(function () {
        var left_side_userlist = this.checked;
        var data = {};
        data.left_side_userlist = JSON.stringify(left_side_userlist);
        change_display_setting(data, '#display-settings-status',
                               i18n.t("Saved. Please <a class='reload_link'>reload</a> for the change to take effect."));
    });

    $("#twenty_four_hour_time").change(function () {
        var data = {};
        var setting_value = $("#twenty_four_hour_time").is(":checked");
        data.twenty_four_hour_time = JSON.stringify(setting_value);
        change_display_setting(data, '#time-settings-status');
    });

    $("#user_timezone").change(function () {
        var data = {};
        var timezone = this.value;
        data.timezone = JSON.stringify(timezone);
        change_display_setting(data, '#time-settings-status');
    });

    $(".emojiset_choice").click(function () {
        var emojiset = $(this).val();
        var data = {};
        data.emojiset = JSON.stringify(emojiset);
        var spinner = $("#emoji-settings-status").expectOne();
        loading.make_indicator(spinner, {text: settings_ui.strings.saving });

        channel.patch({
            url: '/json/settings/display',
            data: data,
            success: function () {
            },
            error: function (xhr) {
                ui_report.error(settings_ui.strings.failure, xhr, $('#emoji-settings-status').expectOne());
            },
        });
    });

    $("#translate_emoticons").change(function () {
        var data = {};
        var setting_value = $("#translate_emoticons").is(":checked");
        data.translate_emoticons = JSON.stringify(setting_value);
        change_display_setting(data, '#emoji-settings-status');
    });
};

exports.report_emojiset_change = function () {
    // TODO: Clean up how this works so we can use
    // change_display_setting.  The challenge is that we don't want to
    // report success before the server_events request returns that
    // causes the actual sprite sheet to change.  The current
    // implementation is wrong, though, in that it displays the UI
    // update in all active browser windows.
    function emoji_success() {
        if ($("#emoji-settings-status").length) {
            loading.destroy_indicator($("#emojiset_spinner"));
            $("#emojiset_select").val(page_params.emojiset);
            ui_report.success(i18n.t("Emojiset changed successfully!"),
                              $('#emoji-settings-status').expectOne());
            var spinner = $("#emoji-settings-status").expectOne();
            settings_ui.display_checkmark(spinner);
        }
    }

    if (page_params.emojiset === 'text') {
        emoji_success();
        return;
    }

    var sprite = new Image();
    sprite.onload = function () {
        var sprite_css_href = "/static/generated/emoji/" + page_params.emojiset + "_sprite.css";
        $("#emoji-spritesheet").attr('href', sprite_css_href);
        emoji_success();
    };
    sprite.src = "/static/generated/emoji/sheet_" + page_params.emojiset + "_32.png";
};

function _update_page() {
    $("#twenty_four_hour_time").prop('checked', page_params.twenty_four_hour_time);
    $("#left_side_userlist").prop('checked', page_params.left_side_userlist);
    $("#default_language_name").text(page_params.default_language_name);
    $("#translate_emoticons").prop('checked', page_params.translate_emoticons);
    $("#night_mode").prop('checked', page_params.night_mode);
    // TODO: Set emojiset selector here.
    // Longer term, we'll want to automate this function
}

exports.update_page = function () {
    i18n.ensure_i18n(_update_page);
};

return exports;
}());

if (typeof module !== 'undefined') {
    module.exports = settings_display;
}
