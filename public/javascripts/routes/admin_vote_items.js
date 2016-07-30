(function () {
    var $addButton = $('.add-btn'),
        $voteItems = $('.vote-items'),
        items = ['_id', 'name', 'description'];

    $('body').delegate('.remove-btn', 'click', function (e) {
        e.preventDefault();
        $(this).parents('tr').eq(0).remove();
        return false;
    });

    $addButton.on('click', function () {
        var idx = $voteItems.find('tr').length;
        var prefix = 'voteItems[' + idx + ']';
        var $tr = $('<tr>');
        items.forEach(function (item) {
            var name = prefix + '[' + item + ']';
            if (item === '_id') {
                $tr.append('<td>(auto)</td>');
            } else {
                $tr.append('<td><input type="text" class="form-control" name="' + name + '"></input></td>');
            }
        });
        $tr.append('<td><button type="button" href="#" class="btn btn-sm btn-danger remove-btn"><i class="glyphicon glyphicon-remove"></i></button></td>');
        $voteItems.append($tr);
    });
}());