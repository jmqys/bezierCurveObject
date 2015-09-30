//************************************
//        BezierCurveObject
//************************************
// ３次ベジェ曲線の情報を保持するオブジェクト
// オブジェクトを３次ベジェ曲線にそって動かすための情報を取得できる
/*
コンストラクタ
　new BezierCurveObject(startX, startY, controlAX, controlAY, controlBX, controlBY, endX, endY)
　　戻り値としてBezierCurveObjectオブジェクトを返します。
　引数（すべて必須です）
　　startX     ベジェ曲線開始位置のx座標
　　startY     ベジェ曲線開始位置のy座標
　　controlAX  開始位置側のコントロールポイントのx座標、bezierCurveToメソッドのcp1xと同じ
　　controlAY  開始位置側のコントロールポイントのy座標、bezierCurveToメソッドのcp1yと同じ
　　controlBX  終了位置側のコントロールポイントのx座標、bezierCurveToメソッドのcp2xと同じ
　　controlBY  終了位置側のコントロールポイントのy座標、bezierCurveToメソッドのcp2yと同じ
　　endX       終了位置のx座標、bezierCurveToメソッドのxと同じ
　　endY       終了位置のy座標、bezierCurveToメソッドのyと同じ

プロパティ
　repeatType
　　移動が終点まで来た時の挙動を0～3の数値で指定します。
　　0:一度だけ移動して、終点で止まる
　　1:始点と終点を往復する
　　2:終点についたら最初に戻る

　atEndInOnewey
　　repeatTypeで0を指定した場合、
　　終点まで移動したらこの値がtrueになります
　　それ以外は常にfalseです。
　
メソッド
　createPointData(length)
　ベジェ曲線の線をlenthの数で分割して、各位置の座標を保持する配列を作成します。
　作成した配列は内部に保持され、getNextPointメソッドで順に取り出すことができます。
　また、同じ配列を戻り値として受け取ることもできます。
　引数
　　length ベジェ曲線を分割する数を指定します。100と指定した場合は、
　　　　　　開始位置から終了位置までを100分割したポイントの座標100個の
　　　　　　配列を作成します。

　stroke()
　コンストラクタ呼び出しの際の引数をもとに3次ベジェ曲線を描画します。

　getNextPoint()
　インスタンス作成直後にこのメソッドを呼ぶと、開始位置のx座標とy座標が戻ります
　その後、呼び出すたびに終了位置に近づいた座標を順に返します。
　※このメソッドを使用する前ににcreatePointDataを実行する必要があります。

　getDirectionRadian()
　getNextPointメソッドを使用して移動している場合の、現在地の角度を取得します
　角度はラジアンで返ってきます。

サンプルメソッド
　以下のサンプルは、
　開始位置　x=40, y=20
　コントロールポイント１　x=150, y=600
　コントロールポイント２　x=300, y=0
　終了位置　x=600, y=460
　で描画できる3次ベジェ曲線に沿って矩形を動かすサンプルです。

	var myCanvas = document.getElementById('canvas');
	var context = myCanvas.getContext('2d');
	var bezier = new BezierCurveObject(40, 20, 150, 600, 300, 0, 600, 460);
	
	// ベジェ曲線を100分割して、それぞれの座標を作成する
	bezier.createPointData(100);
	
	// 矩形が終点に来た時の動きを決める
	bezier.repeatType = 2;
	
	// 50ms毎に描画を行う
	var timer = setInterval(draw, 50);
	
	function draw(){
		// 画面をクリア
		context.clearRect(0, 0, 640, 480);
	
		// 次の座標を取得
		var point = bezier.getNextPoint()
		
		// 曲線を描画
		bezier.stroke(context);
		
		// 矩形を描画
		context.fillRect(point.x, point.y, 10, 10);
		
		// 終点まで移動したときに処理を中止する
		// repeatTypeが0のときのみ使用
		if(bezier.atEndInOnewey){
			console.log('stop');
			clearInterval(timer);
		}
	}
*/

function BezierCurveObject(startX, startY, controlAX, controlAY, controlBX, controlBY, endX, endY){
	var
		_pointData = [{x:startX, y:startY}],
		_currentPoint = 0,
		_currentDerection = 0;
	
	this.atEndInOnewey = false;
	
	// 0:一度だけ移動して、終点で止まる
	// 1:始点と終点を往復する
	// 2:終点についたら最初に戻る
	this.repeatType = 0;
	
	// ベジェ曲線の描画
	this.stroke = function(context){
		context.beginPath();
		context.moveTo(startX, startY);
		context.bezierCurveTo(controlAX, controlAY, controlBX, controlBY, endX, endY);
		context.stroke();
	}
	
	// 曲線に沿った座標の一覧を作成する
	// 曲線の始点から終点までの距離をlengthで割って
	// それぞれの座標を格納する配列を返す
	this.createPointData = function(length){
		var 
			ax, bx, cx, 
			ay, by, cy,
			speed = 1/(length-1),
			t = speed;

		cx = 3 * (controlAX - startX);
		bx = 3 * (controlBX - controlAX) - cx;
		ax = endX - startX - cx - bx;
		
		cy = 3 * (controlAY - startY);
		by = 3 * (controlBY - controlAY) - cy;
		ay = endY - startY - cy - by;
		
		for(var i=0; i<(length-1); i++){
			_pointData.push({
				x:ax*(t*t*t) + bx*(t*t) + cx*t + startX,
				y:ay*(t*t*t) + by*(t*t) + cy*t + startY
			});
			t += speed;
		}
		
		return _pointData;
	}
	
	// 次の座標を取得する
	this.getNextPoint = function(){
		var ret = {
			x:_pointData[_currentPoint].x,
			y:_pointData[_currentPoint].y
		}
		_currentPoint++;
		if(_pointData.length > _currentPoint){
			return ret;
		}
		else{
			switch(this.repeatType){
				case 0: // onewey
					this.atEndInOnewey = true;
					_currentPoint--;
					return {x:endX, y:endY};
					break;
				case 1: // reverse
					_currentPoint = 1;
					_pointData.reverse();
					return ret;
					break;
				case 2: // repeat
					_currentPoint = 0;
					return ret;
					break;
				default :
					throw Error('repeatTypeの指定が間違っています');
			}
		}
	}
	
	// 現在の進行方向の角度を取得する
	this.getDirectionRadian = function(){
		// 次の座標があれば_currentDerectionを更新
		if(_pointData[_currentPoint + 1]){
			var _nextPoint = _pointData[_currentPoint + 1];
			_currentDerection = Math.atan2(
				_nextPoint.y - _pointData[_currentPoint].y,
				_nextPoint.x - _pointData[_currentPoint].x
			);
		}
		return _currentDerection;
	}
}