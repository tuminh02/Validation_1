
//object validator
function validator(options) {
    // function getParent(element, selector) {
    //     while (element.parentElement) {
    //         if (element.parentElement.matches(selector)) {
    //             return element.parentElement
    //         }
    //         element = element.parentElement
    //     }
    // }
    
    //lưu tất cả các rule
    var selectorRules = {}
    //hàm thực hiện validate
    function validate(inputElement, rule) {
        var errorElement = inputElement.parentElement.querySelector(options.errorSelector);
        
        var errorMessage; 
        //lấy ra các rule của selector
        var rules = selectorRules[rule.selector]

        //lặp qua từng rule và kiểm tra
        for(var i = 0; i < rules.length; i++) {
            switch (inputElement.type) {
                case 'radio':      
                case 'checkbox':
                    errorMessage = rules[i](
                        formElement.querySelector(rule.selector + ':checked')
                    )
                    break;
                default:
                    errorMessage = rules[i](inputElement.value)
                    
            }
            if(errorMessage) break;//nếu có lỗi thì dừng việc kiểm tra
        }


                    if (errorMessage) {
                        errorElement.innerText = errorMessage;
                        inputElement.parentElement.classList.add('invalid');
                    }
                    else {
                        errorElement.innerText = '';
                        inputElement.parentElement.classList.remove('invalid');

                    }
                    return !errorMessage;
    }
    //lấy element của form cần validate
    var formElement = document.querySelector(options.form);
  
    if (formElement) {
        formElement.onsubmit = function(e){
            e.preventDefault();
            
            var isFormValid = true;

            //lặp qua từng rule và validate
            options.rules.forEach(function (rule) {
                var inputElement = formElement.querySelector(rule.selector);
                var isValid = validate(inputElement, rule);
                if(!isValid){
                    isFormValid = false;
                }

            })
            
            if(isFormValid){
                //truong hop submit voi javascript
                if(typeof options.onSubmit === 'function'){
                    var enableInput = formElement.querySelectorAll('[name]')
                    
                    var formValues = Array.from(enableInput).reduce(function(values,input){
                        values[input.name] = input.value
                        return  values;                
                    },{})
                    options.onSubmit(formValues);
                }

                //truong hop submit voi hanh vi mac dinh
                else{
                    formElement.submit();
                }
            }
            
        }
        // lặp qua mỗi rule và xử lý 
        options.rules.forEach(function (rule) {

            //lưu lại các rules cho mỗi input
            if(Array.isArray(selectorRules[rule.selector])) {
                selectorRules[rule.selector].push(rule.test);
            }
            else {
                selectorRules[rule.selector] = [rule.test]
            }


            var inputElement = formElement.querySelector(rule.selector);
            if (inputElement) {
                //xu ly truong hop blur ra ngoai
                inputElement.onblur = function () {
                    validate(inputElement,rule);
                }
                //xu ly truong hop khi nhap vao input
                inputElement.oninput = function () {
                    var errorElement = inputElement.parentElement.querySelector(options.errorSelector);
                    errorElement.innerText = ''
                    inputElement.parentElement.classList.remove('invalid');
                    
                }

            }
        })
    }
}


//modified rules
//nguyên tắc của rules:
//khi có lỗi trả ra message lỗi
//khi hợp lệ trả ra không gì cả (undefined)
validator.isRequired = function(selector){
    return {
        selector: selector,
        test: function(value){
            return value ? undefined : "vui lòng nhâp trường này" //trim() loại bỏ các kí tự nhập k hợp lệ (space hàng loạt)
        }
    }
}
validator.isEmail = function(selector){
    return {
        selector: selector,
        test: function(value){
            var regex =/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            return regex.test(value)? undefined : "truong nay phai la email";
        }
    }
}
validator.minLength = function(selector,min){
    return {
            selector: selector,
            test: function(value){
                return value.length >= min? undefined : "vui long nhap toi thieu " + min + " kí tự";
            }
        }
}

validator.isConfirmed = function(selector,getValuePassword, message){
    return {
            selector: selector,
            test: function(value){
                var password = getValuePassword();
                return value === password? undefined : message || "vui long nhap lai";
            }
        }
}