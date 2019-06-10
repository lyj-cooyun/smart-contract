const web3 = new Web3("http://127.0.0.1:7545");

const abi=[{"constant":false,"inputs":[{"name":"toProposalIndex","type":"uint256"}],"name":"vote","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"chairman","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"proposalIndex","type":"uint256"}],"name":"stateOfProposal","outputs":[{"name":"index","type":"uint256"},{"name":"voteCount","type":"uint256"},{"name":"name","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"amount","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"inputs":[{"name":"proposalNames","type":"bytes32[]"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"}]

const bytecode='608060405234801561001057600080fd5b5060405161037f38038061037f8339818101604052602081101561003357600080fd5b81019080805164010000000081111561004b57600080fd5b8281019050602081018481111561006157600080fd5b815185602082028301116401000000008211171561007e57600080fd5b5050929190505050336000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff160217905550805160028190555060008090505b815181101561015757600160405180604001604052808484815181106100f657fe5b60200260200101518152602001600081525090806001815401808255809150509060018203906000526020600020906002020160009091929091909150600082015181600001556020820151816001015550505080806001019150506100d4565b5050610217806101686000396000f3fe608060405234801561001057600080fd5b506004361061004c5760003560e01c80630121b93f1461005157806387f7b9751461007f57806399f9471a146100c9578063aa8c217c14610119575b600080fd5b61007d6004803603602081101561006757600080fd5b8101908080359060200190929190505050610137565b005b610087610166565b604051808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390f35b6100f5600480360360208110156100df57600080fd5b810190808035906020019092919050505061018b565b60405180848152602001838152602001828152602001935050505060405180910390f35b6101216101dc565b6040518082815260200191505060405180910390f35b600180828154811061014557fe5b90600052602060002090600202016001016000828254019250508190555050565b6000809054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b60008060006001848154811061019d57fe5b9060005260206000209060020201600101549150600184815481106101be57fe5b90600052602060002090600202016000015490508392509193909250565b6002548156fea265627a7a723058208dafd0fe7b508f0334a6e89ded673ed46017986d2db50de7bd3b5e1dbfab44a064736f6c63430005090032';

function updateAccounts(){
  web3.eth.getAccounts().then(data=>{
    accounts=data;
    console.log("accounts updated");
  });
}


function getSender(){
  return {from: accounts[0], gas: 1000000};
}


//从已部署的合约拉选项及投票回来
function updateContract() {

  $(".contract table tbody").html("");
  let address = $("#contract-address").val();
  console.log("updating contract: " + address);
  
  //创建一个合约对象
  let contract = new web3.eth.Contract(abi, address);

  for(let i=0;i<2;i++){
    //用提案索引去遍历提案，这里只是演示，可以更严谨
    //注意这里与部署和投票不同，这是本节点上查询，用call，不会产生费用 
    contract.methods.stateOfProposal(i).call()
      .then(e=>{
        $(".contract").css("display","");
        let html = "<tr><td>"+e.index+"</td><td>" + web3.utils.toAscii(e.name) + "</td><td>" + e.voteCount+"</td><td><button class='btn btn-default btn-sm btn-vote'>vote</button></td></tr>";
        $(".contract table tbody").append(html);
      }).catch(console.log);
  }
}


//投票
function vote(btn){
  let vote_id = btn.closest("tr").find("td").html();
  console.log("voting for : " + vote_id);

  // 设置合约对象
  let address = $("#contract-address").val();
  let contract = new web3.eth.Contract(abi, address);

  // 发送投票交易
  contract.methods.vote(parseInt(vote_id)).send(getSender()).then(e=>{console.log(e);updateContract();});
}


//创建合约
function createContract(){
  let proposals = [];
  $(".options").each(function(idx, obj){
    proposals.push(web3.utils.asciiToHex($(obj).val()));
  })
  let contract = new web3.eth.Contract(abi);
  contract.deploy({data: bytecode, arguments: [proposals]}).send(getSender())
    .then(e=>{
      let tips = "New contract created @ <strong>" + e.options.address + "</strong>";
      showTips(tips);
    });
  return false;
}



function showTips(tips){
  $(".alert p").html(tips);
  $(".alert").css("display", "");
}

function hideTips(){
  $(".alert p").html("");
  $(".alert").css("display", "none");
}


$(document).ready(function(){
  //更新账户
  updateAccounts();

  //绑定事件到查询到的合约选项的投票按钮
  $(document).on("click", ".btn-vote", function(){
    vote($(this));
  });

  $("form").on('submit', createContract);
  $(".alert .close").on('click', hideTips);

});

