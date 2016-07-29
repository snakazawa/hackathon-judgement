(function () {
    var $addTeamButton = $('.add-team-btn'),
        $teams = $('.teams'),
        items = ['_id', 'name', 'applicationName', 'usernames'];

    $('body').delegate('.remove-team-btn', 'click', function (e) {
        e.preventDefault();
        $(this).parents('tr').eq(0).remove();
        return false;
    });

    $addTeamButton.on('click', function () {
        var idx = $teams.find('tr').length;
        var prefix = 'teams[' + idx + ']';
        var $tr = $('<tr>');
        items.forEach(function (item) {
            var name = prefix + '[' + item + ']';
            if (item === '_id') {
                $tr.append('<td>(auto)</td>');
            } else {
                $tr.append('<td><input type="text" class="form-control" name="' + name + '"></input></td>');
            }
        });
        $tr.append('<td><button type="button" href="#" class="btn btn-sm btn-danger remove-team-btn"><i class="glyphicon glyphicon-remove"></i></button></td>');
        $teams.append($tr);
    });
}());