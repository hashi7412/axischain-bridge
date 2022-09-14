import { toast } from 'react-toastify';


export const errHandler = (err:any) => {
	if (err) {
		console.log(err)
		if (err.code===4001) {
			tips("您取消认购了")
		} else if (err.code==='NETWORK_ERROR') {
			tips("请检查网络连接！")
		} else {
			tips(err.message)
		}
	} else {
		console.log("无知错误")
		tips("无知错误")
	}
}

export const tips = (html:string) => {
	toast(html, {
		position: "top-right",
		autoClose: 1000,
	});
}
export const NF = (num:number,p:number=2) => Number(num).toFixed(p).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
export const TF = (time:number,offset:number=2) => {
    let iOffset = Number(offset);
	let date = time===undefined ? new Date(Date.now()*1000 + (3600000 * iOffset)) : (typeof time==='number'?new Date(time*1000 + (3600000 * iOffset)):new Date(+time + (3600000 * iOffset)));
	let y=date.getUTCFullYear();
	let m=date.getUTCMonth() + 1;
	let d=date.getUTCDate();
	let hh=date.getUTCHours();
	let mm=date.getUTCMinutes();
	let ss=date.getUTCSeconds();
	let dt=("0" + m).slice(-2) + "-" + ("0" + d).slice(-2);
	let tt=("0" + hh).slice(-2) + ":" + ("0" + mm).slice(-2) + ":" + ("0" + ss).slice(-2);
    return y+'-'+dt+' '+tt;
}

export const copyToClipboard = (text:string) => {
	var textField = document.createElement('textarea')
	textField.innerText = text
	document.body.appendChild(textField)
	textField.select()
	document.execCommand('copy')
	textField.remove()
	tips(text);
};
