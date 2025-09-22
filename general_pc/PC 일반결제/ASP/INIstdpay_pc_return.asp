<% @Language="VBScript" CODEPAGE="949" %>
<%
Response.CharSet="euc-kr"
Session.codepage="949"
Response.codepage="949"
Response.ContentType="text/html;charset=euc-kr"
%>
<!--#include virtual="/include/function.asp"-->
<!--#include virtual="/include/signature.asp"-->
<!--#include virtual="/include/aspJSON1.17.asp"-->
<!--#include virtual="/include/properties.asp"-->

<!DOCTYPE html>
<html lang="ko">

    <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport"
            content="width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <title>KG�̴Ͻý� ��������</title>
        <link rel="stylesheet" href="css/style.css">
		<link rel="stylesheet" href="css/bootstrap.min.css">
    </head>

    <body class="wrap">

        <!-- ���� -->
        <main class="col-8 cont" id="bill-01">
            <!-- ������Ÿ��Ʋ -->
            <section class="mb-5">
                <div class="tit">
                    <h2>�Ϲݰ���</h2>
                    <p>KG�̴Ͻý� ����â�� ȣ���Ͽ� �پ��� ���Ҽ������� ������ ������ �����ϴ� ����</p>
                </div>
            </section>
            <!-- //������Ÿ��Ʋ -->


            <!-- ī��CONTENTS -->
            <section class="menu_cont mb-5">
                <div class="card">
                    <div class="card_tit">
                        <h3>PC �Ϲݰ���</h3>
                    </div>

                    <!-- ���ǻ��� -->
                    <div class="card_desc">
                        <h4>�� ���ǻ���</h4>
                        <ul>
                            <li>�׽�ƮMID ������ �� ���εǸ�, ���� ����(24:00) ������ �ڵ����� ���ó�� �˴ϴ�.</li>
							<li>������� ä�� �� �Ա��� ��� �ڵ�ȯ�ҵ��� �ʻ����, ������������ �� "�Ա��뺸�׽�Ʈ" �޴��� �̿��Ź�帳�ϴ�.<br>(�� �Ա��Ͻ� ��� ������ ȯ�ҿ�û���ּž� �մϴ�.)</li>
							<li>����ī�� ��å�� �׽�Ʈ ������ �Ұ��Ͽ� ������ �߻��� �� �ֽ��ϴ�. ����, īī����ũ �� �ٸ� ī��� �׽�Ʈ���� ��Ź�帳�ϴ�.</li>
                        </ul>
                    </div>
                    <!-- //���ǻ��� -->


<% 
		'#############################
		' ������� �Ķ���� �ϰ� ����
		'#############################

		Set oJSON = New aspJSON

		if ("0000"=request("resultCode")) then

			'############################################
			' 1.���� �ʵ� �� ����(***������ ���߼���***)
			'############################################
			
			maid 		= request("mid")							' ������ ID ���� ���� �����ͷ� ����
			signKey 	= "SU5JTElURV9UUklQTEVERVNfS0VZU1RS"		' ������ ID �� ��Ī�Ǵ� signkey
			correct 	= "09"										' ǥ�ؽÿ��� ���̸� 2�ڸ� ���ڷ� �Է� (��: ���ѹα��� ǥ�ؽÿ� 9�ð� �����̹Ƿ� 09)
			timestamp	= time_stamp(correct)
			charset 	= "EUC-KR"									' ��������[UTF-8,EUC-KR](������ ������ ����)
			format 		= "JSON"									' ��������[XML,JSON,NVP](������ ������ ����)	
			authUrl	    = request("authUrl")                        ' ���ο�û API url(���� ���� ������ ����, ���� ���� ����)
			authToken	= request("authToken")						' ��� ��û tid�� ���� ������(������ ������ ����)
			netCancel	= request("netCancelUrl")					' ����� API url(���� ���� ������ ����, ���� ���� ����)
			merchantData= request("merchantData")					' ������ ���������� ����

			
			'############################################
			' 2.signature �� verification ����
			'############################################
			signParam = "authToken=" & replace(authToken," ", "+")	
			signParam = signParam & "&timestamp=" & timestamp
			signature = MakeSignature(signParam)
			
			verifyParam = "authToken=" & replace(authToken," ", "+")	
			verifyParam = verifyParam & "&signKey=" & signKey
			verifyParam = verifyParam & "&timestamp=" & timestamp
			verification = MakeSignature(verifyParam)
			

			'#####################
			' 3.API ��û ���� ����
			'#####################

			dim xmlHttp,  postdat
			Set xmlHttp = CreateObject("Msxml2.XMLHTTP")

			send_text = "mid="&maid
			send_text = send_text & "&timestamp="&timestamp
			send_text = send_text & "&signature="&signature
			send_text = send_text & "&verification="&verification
			send_text = send_text & "&authToken="&Server.URLEncode(authToken)
			send_text = send_text & "&charset="&charset
			send_text = send_text & "&format="&format
			

			'#####################
			' 4.API ��� ����
			
			' ���ο�û API url (autnUrl) ����Ʈ �� properties �� �����Ͽ� ����մϴ�.
            ' idc_name ���� ���� ���� ���� ������ properties ���� include �Ͽ� ���ο�û�Ͻø� �˴ϴ�.
			'#####################
			
			if authUrl = authreqUrl then
			    
 			    xmlHttp.Open "POST", authreqUrl, False
 			    xmlHttp.setRequestHeader "Content-Type", "application/x-www-form-urlencoded; text/html; charset=euc-kr"
			    xmlHttp.Send send_text
			    result=Cstr( xmlHttp.responseText )
			    
			    Set oJSON = New aspJSON
			    oJSON.loadJSON(result)
				
			   else response.write ("authUrl Check Fail")
			
			End if
				
			'############################################################
			'5.API ��Ű�� ó��(***������ ���߼���***)
			'############################################################


			if "0000"=oJSON.data("resultCode")  then
			
			
			            response.write("<form name='' id='result' method='post' class='mt-5'>")
						response.write("<div class='row g-3 justify-content-between' style='--bs-gutter-x:0rem;'>")
                        response.write("<label class='col-10 col-sm-2 gap-2 input param' style='border:none;'>resultCode</label>")
                        response.write("<label class='col-10 col-sm-9 reinput'>"& oJSON.data("resultCode")&"</label>")
						
						response.write("<label class='col-10 col-sm-2 gap-2 input param' style='border:none;'>resultMsg</label>")
                        response.write("<label class='col-10 col-sm-9 reinput'>"& oJSON.data("resultMsg")&"</label>")
						
						response.write("<label class='col-10 col-sm-2 gap-2 input param' style='border:none;'>tid</label>")
                        response.write("<label class='col-10 col-sm-9 reinput'>"& oJSON.data("tid")&"</label>")
						
						response.write("<label class='col-10 col-sm-2 gap-2 input param' style='border:none;'>MOID</label>")
                        response.write("<label class='col-10 col-sm-9 reinput'>"& oJSON.data("MOID")&"</label>")
						
						response.write("<label class='col-10 col-sm-2 gap-2 input param' style='border:none;'>TotPrice</label>")
                        response.write("<label class='col-10 col-sm-9 reinput'>"& oJSON.data("TotPrice")&"</label>")
						
						response.write("<label class='col-10 col-sm-2 gap-2 input param' style='border:none;'>goodName</label>")
                        response.write("<label class='col-10 col-sm-9 reinput'>"& oJSON.data("goodName")&"</label>")
						
						response.write("<label class='col-10 col-sm-2 gap-2 input param' style='border:none;'>applDate</label>")
                        response.write("<label class='col-10 col-sm-9 reinput'>"& oJSON.data("applDate")&"</label>")
						
						response.write("<label class='col-10 col-sm-2 gap-2 input param' style='border:none;'>applTime</label>")
                        response.write("<label class='col-10 col-sm-9 reinput'>"& oJSON.data("applTime")&"</label>")

                        response.write("</div></form>")						

			    '/*****************************************************************************
			    ' * ���⿡ ������ ���� DB�� ���� ����� �ݿ��ϴ� ���� ���α׷� �ڵ带 �����Ѵ�.  
			    '
			    '   [�߿�!] ���γ��뿡 �̻��� ������ Ȯ���� �� ������ DB�� �ش���� ����ó�� �Ǿ����� �ݿ���
			    '            ó���� ���� �߻��� ����Ҹ� �Ѵ�.
			    '******************************************************************************/

						On Error Resume Next			' ������ �� ��� ����

					' �̺κп� DB ��ϵ� ���� ���� ���� 
					' ���� �߻��� �����
							If Err.Number > 0 Then 
							'### ����� ��� ����
								response.write("##����� ��û##</br>")
								send_text = "timestamp="&timestamp
								send_text = send_text & "&mid="&maid
								send_text = send_text & "&tid="&oJSON.data("tid")
								send_text = send_text & "&authToken="&Server.URLEncode(authToken)
								send_text = send_text & "&signature="&signature
								send_text = send_text & "&verification="&verification
								send_text = send_text & "&format="&format
								send_text = send_text & "&charset="&charset
								
					 			xmlHttp.Open "POST", netCancel, False
					 			xmlHttp.setRequestHeader "Content-Type", "application/x-www-form-urlencoded; text/html; charset=euc-kr"
								xmlHttp.Send send_text
								ask_result=Cstr( xmlHttp.responseText )
								Set xmlHttp = nothing
									response.write "<br>" &  ask_result &"<br>"
									'################# ask_result�� ��ȯ�� ���� ��  "resultCode": "0000"  �̸� ���� ����� ó��.
								response.end
			  			End If   
						Err.Clear      ' Clear the error.
						On Error GoTo 0
					' ����ҿ������
				Set xmlHttp = nothing
				
			' ���Ű���� �Ľ��� resultCode�� "0000"�̸� ���μ��� �̿� ����
			' ���������� ������ �Ľ��� ���� DB ó�� �� ȭ�鿡 ��� ǥ��
			
			else 
			            response.write("<form name='' id='result' method='post' class='mt-5'>")
						response.write("<div class='row g-3 justify-content-between' style='--bs-gutter-x:0rem;'>")
                        response.write("<label class='col-10 col-sm-2 gap-2 input param' style='border:none;'>resultCode</label>")
                        response.write("<label class='col-10 col-sm-9 reinput'>"& oJSON.data("resultCode")&"</label>")
						
						response.write("<label class='col-10 col-sm-2 gap-2 input param' style='border:none;'>resultMsg</label>")
                        response.write("<label class='col-10 col-sm-9 reinput'>"& oJSON.data("resultMsg")&"</label>")
						
						response.write("</div></form>")		


			' payViewType�� popup���� �ؼ� ������ �ϼ��� ���
			' ����ó���� ��ũ��Ʈ�� �̿��� opener�� ȭ�� ��ȯó���� �ϼ���
			end if

		else 
				'#############
				' ���� ���н�
				'#############
				response.write("<br/><br/><br/>")
				response.write("####��������####")

				For each item in Request.Form
				    for i = 1 to Request.Form(item).Count
				    	if not(item="authToken") then
								response.write("<pre>" & item & " = " & Request.Form(item)(i) & "</pre>")
							end if
				 Next
				Next



		end if
	Set oJSON = Nothing
		
%>

				<button onclick="location.href='INIstdpay_pc_req.asp'" class="btn_solid_pri col-6 mx-auto btn_lg" style="margin-top:50px">���ư���</button>
					
                </div>
            </section>
			
        </main>
		
    </body>
</html>