Vue.use(Toasted);
// Vue.toasted.show(文字內容,{
//   duration:1500, 停留時間 1000=1秒
//   className:['toasted-primary','bg-danger'], 自訂class
// });

var signature_sign_in_data = {
    id: "",
    complete: "0",
	imgs: [],
	signatures: [],
	edit_view:{},
};
var signature_sign_inVM = new Vue({
    el: '#signature_sign_in', 
    data: signature_sign_in_data,
    computed: {
        unsign_num: function(){
            count = 0;
            for (var i = 0; i < this.signatures.length; i++) {
                if(typeof(this.signatures[i].sign)=='undefined'){
                    count += 1;
                    continue;
                }
                if(this.signatures[i].sign==""){
                    count += 1;
                    continue;
                }
            }
            return count;
        },
    },
    updated: function () {
	  this.$nextTick(function () {
	    // Code that will run only after the
	    // entire view has been re-rendered
	  })
	},
    methods: {
        get_data: function(id){
            self = this;
            $.ajax({
                method:'post',
                data:{id: id},
                url:"/",
                success:function(res){
                    self.id = id; /*測試用*/
                    // self.id = res['id'];
                    
                    self.complete = 0; /*測試用*/
                    // self.complete = res['flag'];
                    
                    self.imgs = ['./images/contract_0.jpg', './images/contract_1.jpg']; /*測試用*/
                    // self.imgs = res['imgs'];
                    
                    setTimeout(function(){
                        var signatures = [ /*測試用*/
                            {w:0.27548209366391185, h:0.01951219512195122, p_x:0.34710743801652894, p_y:0.11073170731707317, sign:""},
                            {w:0.13774104683195593, h:0.01951219512195122, p_x:0.6680440771349863, p_y:0.204390243902439, sign:""},
                            {w:0.3443526170798898, h:0.01951219512195122, p_x:0.2327823691460055, p_y:0.8000975371570122, sign:""},
                        ];
                        // var signatures = res['signatures'] ? res['signatures'] : [];

                        for (var i = 0; i < signatures.length; i++) {
                            signatures[i].w = signatures[i].w * 100;
                            signatures[i].h = signatures[i].h * 100;
                            signatures[i].p_x = signatures[i].p_x * 100;
                            signatures[i].p_y = signatures[i].p_y * 100;
                            if(typeof(signatures[i].sign)=='undefined'){
                                signatures[i].sign = "";
                            }
                        }
                        self.signatures = signatures;
                    }, 1000);
                }
            });
        },
        reset_edit_view: function(){
        	this.edit_view = {
				i: "",
                sign: "",
			};
            sigPad.clearCanvas();
        },
        eidt_signature: function(index){
        	this.edit_view.i = index;
        	this.edit_view.sign = this.signatures[index].sign;

            /*添加畫板*/
            var win_w = $(window).width();
            var target_sign = $('#signature_click_' + index);
            if(is_computer()){
                win_w += 17; /*電腦會有轉軸，寬度需外加*/
            }
            if(win_w < 576){
                can_w = win_w - (0.5 + 1) * 2 * 16
            }else{
                can_w = 498  - (1) * 2 * 16;
            }
            var can_h = can_w / target_sign.width() * target_sign.height();
            $('canvas').attr('width', can_w);
            $('canvas').attr('height', can_h);
            
        },
        save_signature: function(){
        	this.signatures[this.edit_view.i].sign = sigPad.getSignatureImage();

        	$('#signatureEditView .close').click();
        	this.reset_edit_view();
        },
        submit: function(){
            if(this.unsign_num != 0){
                msg = "還有" + this.unsign_num + "處未簽名"
                Vue.toasted.show(msg, { duration: 1500, className: ["toasted-primary", "bg-danger"] });
                return;
            }

        	self = this;
            var data = {                
                id: self.id,
                signatures: self.signatures,
            };

        	/*送出資料*/
        	$.ajax({
				method:'post',
				url:"/",
				data: data,
				success:function(res){
                    // bg = res.status == 1 ? "bg-success" : "bg-danger";
                    // Vue.toasted.show(res.info, { duration: 1500, className: ["toasted-primary", bg] });
				    // if(res.status == 1){
                        // self.complete = "1";
                    // }

                    /*測試用*/
                    Vue.toasted.show('儲存成功', { duration: 1500, className: ["toasted-primary", 'bg-success'] });
                    self.complete = "1";
                }
			});
        },

        print: function(){
            self = this;
            // window.print();
            html2canvas(document.querySelector("html")).then(canvas => {
                document.body.appendChild(canvas);

                var dataURL = canvas.toDataURL();
                // console.log(dataURL);

                var a = document.createElement("a");
                a.href = dataURL;
                a.download = '合約截圖';
                a.click();
                a.remove();
            });

        },

        /*EIP功能*/
        select_file: function(index){
            self = this;
            var add_img_input = $('#input_' + index);
            const [file] = add_img_input[0].files
            self.questions[index].file_name = file.name;
            if (file) {
                var reader = new FileReader();
                reader.onload = function (data) {
                    self.questions[index].ans = data.target.result;
                    // console.log(data.target.result);
                };
                reader.readAsDataURL(file);
            }else{
                Vue.toasted.show("請選擇檔案", { duration: 1500, className: ["toasted-primary", "bg-danger"] });
            }
        },
        has_question: function(i_s, i_e){
            var has = false;
            if(this.questions){
                for (var i = 0; i < this.questions.slice(i_s, i_e).length; i++) {
                    if(this.questions[i_s + i].online == '1' && this.questions[i_s + i].name != ''){
                        has = true;
                        break;
                    }
                }
            }
            return has;
        },
    },
});

/*判斷是電腦還是手機*/
function is_computer() {
    var sUserAgent= navigator.userAgent.toLowerCase();
    var bIsIpad= sUserAgent.match(/ipad/i) == "ipad";
    var bIsIphoneOs= sUserAgent.match(/iphone os/i) == "iphone os";
    var bIsMidp= sUserAgent.match(/midp/i) == "midp";
    var bIsUc7= sUserAgent.match(/rv:1.2.3.4/i) == "rv:1.2.3.4";
    var bIsUc= sUserAgent.match(/ucweb/i) == "ucweb";
    var bIsAndroid= sUserAgent.match(/android/i) == "android";
    var bIsCE= sUserAgent.match(/windows ce/i) == "windows ce";
    var bIsWM= sUserAgent.match(/windows mobile/i) == "windows mobile";
    if (bIsIpad || bIsIphoneOs || bIsMidp || bIsUc7 || bIsUc || bIsAndroid || bIsCE || bIsWM) {
       return false;
    } else {
       return true;
    }
}