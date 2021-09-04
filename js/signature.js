Vue.use(Toasted);
// Vue.toasted.show(文字內容,{
//   duration:1500, 停留時間 1000=1秒
//   className:['toasted-primary','bg-danger'], 自訂class
// });

var ori_x = 0; // 紀錄原始x位置
var ori_y = 0; // 紀錄原始y位置
var timeOut = null; // 用以儲存timeOute物件
var hasMove = false; // 紀錄滑鼠是否有拖移
var signature_data = {
    cat_id: "",
	imgs: [],
	signatures: [],
	edit_view:{
		method: 'add',
		i: "",
		w: 0,
		h: 0,
		p_x: 0,
        p_y: 0,
        sign: "",
	},
};
var signatureVM = new Vue({
    el: '#signature', 
    data: signature_data,
    computed: {
    },
    updated: function () {
	  this.$nextTick(function () {
	    // Code that will run only after the
	    // entire view has been re-rendered
	  })
	},
    methods: {
        get_data: function(cat_id){
            self = this;
            self.cat_id = cat_id;
            
            $.ajax({
                method:'post',
                data:{cat_id: self.cat_id},
                url:"/",
                success:function(res){
                    // self.imgs = res['imgs'];

                    // /*還原比例成固定px*/
                    // setTimeout(function(){
                    //     var signatures = res['signatures'];
                    //     all_w = $('.overflow_hidden').width();
                    //     all_h = $('.overflow_hidden').height();
                    //     for (var i = 0; i < signatures.length; i++) {
                    //         signatures[i].w = signatures[i].w * all_w;
                    //         signatures[i].h = signatures[i].h * all_h;
                    //         signatures[i].p_x = signatures[i].p_x * all_w;
                    //         signatures[i].p_y = signatures[i].p_y * all_h;
                    //     }
                    //     self.signatures = signatures;
                    // },1000);
                }
            });
            
        },
    	add_img: function(){
            self = this;
            var add_img_input = $('#add_img');
            const [file] = add_img_input[0].files
            if (file) {
                var reader = new FileReader();
                reader.onload = function (data) {
                    self.imgs.push(data.target.result);
                    // console.log(data.target.result);
                    add_img_input.val('');
                };
                reader.readAsDataURL(file);
            }else{
            	Vue.toasted.show("請選擇圖片", { duration: 1500, className: ["toasted-primary", "bg-danger"] });
            }
        },
        cancel_img: function(index){
        	this.imgs.splice(index, 1);
        },
        cancel_imgs: function(){
            this.imgs = [];
        },
        reset_edit_view: function(){
        	this.edit_view = {
				method: 'add',
				i: "",
				w: 100,
				h: 40,
				p_x: 0,
        		p_y: document.getElementById("view_area_content").scrollTop,
                sign: "",
			};
        },
        eidt_signature: function(index){
        	this.edit_view = Object.assign({}, this.signatures[index]);
        	this.edit_view.method = 'edit';
        	this.edit_view.i = index;
        },
        save_signature: function(){
        	if(this.imgs.length < 1){
        		Vue.toasted.show("請先上傳圖片", { duration: 1500, className: ["toasted-primary", "bg-danger"] });
        		$('#signatureEditView .close').click();
        		this.reset_edit_view();
        		return;
        	}

        	index = this.edit_view.i
        	if(index===""){ /*新增*/
				this.signatures.push({
	        		w: this.edit_view.w,
	        		h: this.edit_view.h,
	        		p_x: this.edit_view.p_x,
	        		p_y: this.edit_view.p_y,
	        	});
        	}else{ /*編輯*/
        		this.signatures[index] = this.edit_view;
        	}
        	
        	$('#signatureEditView .close').click();
        	this.reset_edit_view();
        },
        cancel_signature: function(index){
        	this.signatures.splice(index, 1);
        	$('#signatureEditView .close').click();
        	this.reset_edit_view();
        },
        cancel_signatures: function(){
            this.signatures = [];
        },
        click_one_time: function (index, work) {
            if (!hasMove) {
                clearTimeout(timeOut); /*清除計時器，停止其他單擊的執行*/
                timeOut = setTimeout(() => {
                    /*延後執行，以便確認是單擊還是雙擊*/
                    $('#open_btn').click()
                }, 300); // 大概時間300ms
            } else {
                hasMove = false; /*設定為位移動*/
            }
        },
        move_signature: function (index, signature) {
        	self = this;
        	/*滑鼠放掉時清空html對滑鼠移動的事件*/
            $("html").one("mouseup", function (e) {
                if (hasMove) {
                    Vue.toasted.show("拖移結束", { duration: 1500, className: ["toasted-primary", "bg-success"] });
                }
                $("html").off("mousemove");
                ori_x = 0;
                ori_y = 0;
            });

            /*定義滑鼠在html上移動的事件*/
            $("html").on("mousemove", function (e) {
                if (!hasMove) Vue.toasted.show("拖移開始", { duration: 1500 });
                hasMove = true; /*有拖移*/
                if (ori_x != 0 || ori_y != 0) {
                    diff_x = self.get_move_diff(ori_x, e.clientX);
                    diff_y = self.get_move_diff(ori_y, e.clientY);
                    
                    // console.log([e.clientX, e.clientY])
                    // console.log([diff_x, diff_y])
                    maxw = $('.overflow_hidden').width() - signature.w;
                    maxh = $('.overflow_hidden').height() - signature.h;
                    if (diff_x || diff_y) { /*如果有調整到位置*/
                        /*更新位置*/
                        if(signature.p_x + diff_x >=0 && signature.p_x + diff_x <=maxw)
                        	self.signatures[index].p_x += diff_x;
                        if(signature.p_y + diff_y >=0 && signature.p_y + diff_y <=maxh)
							self.signatures[index].p_y += diff_y;

                        ori_x = e.clientX; /*更新紀錄起始點x位置*/
                    	ori_y = e.clientY; /*更新紀錄起始點y位置*/
                    }
                } else {
                    ori_x = e.clientX; /*更新紀錄起始點x位置*/
                    ori_y = e.clientY; /*更新紀錄起始點y位置*/
                }
            });
        },
        get_move_diff: function(o_p, n_p){
        	diff = (n_p - o_p);
        	return diff;
        },
        submit: function(){
        	self = this;

            /*轉換w, h, x, y成比例*/
            var signatures = [];
            all_w = $('.overflow_hidden').width();
            all_h = $('.overflow_hidden').height();
            for (var i = 0; i < self.signatures.length; i++) {
                signatures.push({
                    w: self.signatures[i].w / all_w,
                    h: self.signatures[i].h / all_h,
                    p_x: self.signatures[i].p_x / all_w,
                    p_y: self.signatures[i].p_y / all_h,
                });
            }

            var data = { 
                cat_id: self.cat_id,
                imgs: self.imgs,
                signatures: signatures,
            };

        	/*送出資料*/
        	$.ajax({
				method:'post',
				url:"/",
				data: data,
				success:function(res){
					Vue.toasted.show('更新成功', { duration: 1500, className: ["toasted-primary", "bg-success"] });
				}
			});
        },
    },
});
signatureVM.reset_edit_view();