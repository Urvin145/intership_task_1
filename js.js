$(document).ready(function () {

    var iti = intlTelInput(document.querySelector("#phoneNumber"), {
        initialCountry: "in",
        geoIpLookup: function (success, failure) {
            $.get("https://ipinfo.io", function () { }, "jsonp").always(function (resp) {
                var countryCode = (resp && resp.country) ? resp.country : "us";
                success(countryCode);
            });
        },
        utilsScript: "https://cdn.jsdelivr.net/npm/intl-tel-input@17.0.13/build/js/utils.js"
    });

    // Fetch data from API using AJAX
    $.ajax({
        url: 'https://glexas.com/hostel_data/API/raj/new_admission_crud.php',
        method: 'GET',
        dataType: 'json',
        success: function (response) {
            if (response.status === true) {
                var data = response.response;
                populateDataTable(data);
            } else {
                console.error("API request failed: " + response.message);
                Swal.fire('Error', 'API request failed: ' + response.message, 'error');
            }
        },
        error: function (status, error) {
            console.error(status, error);
            Swal.fire('Error', 'API request failed: ' + error, 'error');
        }
    });

    // Function to populate DataTable with fetched data
    function populateDataTable(data) {
        data.forEach(function (entry) {
            var fullName = entry.first_name + " " + entry.middle_name + " " + entry.last_name;
            var createdTime = new Date(entry.created_time).toLocaleString();
            var createdTimeMoment = moment(entry.created_time);
            var currentTime = moment();
            var timeDiff = currentTime.diff(createdTimeMoment, 'hours');

            var editButton = timeDiff <= 24 ? '<button class="btn btn-primary edit-btn" data-id="' + entry.registration_main_id + '" data-userCode="' + entry.user_code + '" data-firstName="' + entry.first_name + '" data-lastName="' + entry.last_name + '" data-middleName="' + entry.middle_name + '" data-phoneNumber="' + entry.phone_number + '" data-phoneCountryCode="' + entry.phone_country_code + '" data-email="' + entry.email + '">Edit</button>' : '';
            var deleteButton = timeDiff <= 24 ? '<button class="btn btn-danger delete-btn" data-id="' + entry.registration_main_id + '">Delete</button>' : '';

            dataTable.row.add([
                entry.registration_main_id,
                fullName,
                entry.email,
                entry.user_code,
                entry.phone_country_code,
                entry.phone_number,
                editButton + ' ' + deleteButton
            ]).draw(false);
        });
    }


    var dataTable = $('#hostelData').DataTable();

    // Click event for add button
    $('#addButton').click(function () {
        $('#addEditModal').modal('show');
        // Clear form fields
        $('#dataForm')[0].reset();
        iti.setNumber('');

        $('#dataForm').off('submit').submit(function (event) {
            event.preventDefault();

            if ($("#dataForm").valid()) {
                var formData = $(this).serializeArray();
                var admissionData = {
                    user_code: $('#userCode').val(),
                    first_name: $('#firstName').val(),
                    middle_name: $('#middleName').val(),
                    last_name: $('#lastName').val(),
                    phone_number: $('#phoneNumber').val(),
                    phone_country_code: iti.getSelectedCountryData().dialCode,
                    email: $('#email').val(),
                };
                console.log(admissionData);

                $.ajax({
                    url: 'https://glexas.com/hostel_data/API/raj/new_admission_crud.php',
                    method: 'POST',
                    dataType: 'json',
                    data: admissionData,
                    success: function (response) {
                        if (response.status === true) {
                            console.log('Data added successfully.');
                            Swal.fire('Success', 'Data added successfully.', 'success').then(() => {
                                $('#addEditModal').modal('hide');
                                location.reload(true);
                            });
                        } else {
                            console.error("Operation failed: " + response.message);
                            Swal.fire('Error', 'Operation failed: ' + response.message, 'error');
                        }
                    },
                    error: function (status, error) {
                        console.error(status, error);
                        Swal.fire('Error', 'API request failed: ' + error, 'error');
                    }
                });
            }
        });
    });

    // Click event for edit button
    $(document).on('click', '.edit-btn', function () {
        var registrationId = $(this).attr('data-id');
        $('#addEditModal').modal('show');
        $('#registrationMainId').val(registrationId);
        $('#userCode').val($(this).attr('data-userCode'));
        $('#firstName').val($(this).attr('data-firstName'));
        $('#middleName').val($(this).attr('data-middleName'));
        $('#lastName').val($(this).attr('data-lastName'));
        iti.setNumber($(this).attr('data-phoneNumber'));
        $('#email').val($(this).attr('data-email'));


        $('#dataForm').off('submit').submit(function (event) {
            event.preventDefault();

            if ($("#dataForm").valid()) {
                var formData = $(this).serializeArray();
                var admissionData = {
                    registration_main_id: $('#registrationMainId').val(),
                    user_code: $('#userCode').val(),
                    first_name: $('#firstName').val(),
                    middle_name: $('#middleName').val(),
                    last_name: $('#lastName').val(),
                    phone_number: $('#phoneNumber').val(),
                    phone_country_code: iti.getSelectedCountryData().dialCode,
                    email: $('#email').val(),
                };
                console.log(admissionData);

                $.ajax({
                    url: 'https://glexas.com/hostel_data/API/raj/new_admission_crud.php',
                    method: 'PUT',
                    dataType: 'json',
                    data: JSON.stringify(admissionData),
                    success: function (response) {
                        if (response.status === true) {
                            console.log('Data updated successfully.');
                            Swal.fire('Success', 'Data updated successfully.', 'success').then(() => {
                                $('#addEditModal').modal('hide');
                                location.reload(true);
                            });
                        } else {
                            console.error("Operation failed: " + response.message);
                            Swal.fire('Error', 'Operation failed: ' + response.message, 'error');
                        }
                    },
                    error: function (status, error) {
                        console.error(status, error);
                        Swal.fire('Error', 'API request failed: ' + error, 'error');
                    }
                });
            }
        });
    });

    // Click event for delete button
    $(document).on('click', '.delete-btn', function () {
        var registrationId = $(this).data('id');
        Swal.fire({
            title: 'Are you sure?',
            text: "You want to delete this!!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        }).then((result) => {
            if (result.isConfirmed) {
                var deleteData = {
                    registration_main_id: registrationId
                };

                $.ajax({
                    url: 'https://glexas.com/hostel_data/API/raj/new_admission_crud.php',
                    method: 'DELETE',
                    dataType: 'json',
                    data: JSON.stringify(deleteData),
                    success: function (response) {
                        if (response.status === true) {
                            console.log('Data deleted successfully.');
                            location.reload(true);
                        } else {
                            console.error("Deletion failed: " + response.message);
                            Swal.fire('Error', 'Deletion failed: ' + response.message, 'error');
                        }
                    },
                    error: function (status, error) {
                        console.error(status, error);
                        Swal.fire('Error', 'API request failed: ' + error, 'error');
                    }
                });
                return false;
            }
        });
    });

    // Apply jQuery validation to the form
    $("#dataForm").validate({
        rules: {
            userCode: "required",
            firstName: "required",
            middleName: "required",
            lastName: "required",
            phoneNumber: {
                required: true
            },
            email: {
                required: true,
                email: true
            }
        },
        messages: {
            userCode: "Please enter user code",
            firstName: "Please enter first name",
            middleName: "Please enter middle name",
            lastName: "Please enter last name",
            phoneNumber: "Please enter a valid phone number",
            email: "Please enter a valid email address"
        },
        errorElement: "div",
        errorPlacement: function (error, element) {
            error.addClass("invalid-feedback");
            if (element.prop("type") === "checkbox") {
                error.insertAfter(element.siblings("label"));
            } else {
                error.insertAfter(element);
            }
        },
        highlight: function (element) {
            $(element).addClass("is-invalid").removeClass("is-valid");
        },
        unhighlight: function (element) {
            $(element).addClass("is-valid").removeClass("is-invalid");
        }
    });
});
