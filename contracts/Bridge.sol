// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Ownable {
  address public owner;


  event OwnershipRenounced(address indexed previousOwner);
  event OwnershipTransferred(
	address indexed previousOwner,
	address indexed newOwner
  );


  /**
   * @dev The Ownable constructor sets the original `owner` of the contract to the sender
   * account.
   */
  constructor() {
	owner = msg.sender;
  }

  /**
   * @dev Throws if called by any account other than the owner.
   */
  modifier onlyOwner() {
	require(msg.sender == owner);
	_;
  }
  
  /**
   * @dev Allows the current owner to transfer control of the contract to a newOwner.
   * @param newOwner The address to transfer ownership to.
   */

  function transferOwnership(address newOwner) public onlyOwner {
	require(newOwner != address(0));
	emit OwnershipTransferred(owner, newOwner);
	owner = newOwner;
  }

  /**
   * @dev Allows the current owner to relinquish control of the contract.
   */
  function renounceOwnership() public onlyOwner {
	emit OwnershipRenounced(owner);
	owner = address(0);
  }
}

contract ERC20 is Ownable {
	event Approval(address indexed owner, address indexed spender, uint value);
	event Transfer(address indexed from, address indexed to, uint value);
	
	
	mapping(address => uint256) private _balances;

	mapping(address => mapping(address => uint256)) private _allowances;
	
	uint256 public totalSupply;
	string public name;
	string public symbol;
	uint8 public decimals;
	bool public isBridgeToken = true;

	constructor(string memory _name, string memory _symbol, uint8 _decimals) {
		name = _name;
		symbol = _symbol;
		decimals = _decimals;
	}
	
	function getOwner() public view returns (address) {
		return owner;
	}

	function balanceOf(address account) public  view returns (uint256) {
		return _balances[account];
	}

	function transfer(address recipient, uint256 amount) public  returns (bool) {
		_transfer(msg.sender, recipient, amount);
		return true;
	}

	function allowance(address account, address spender) public  view returns (uint256) {
		return _allowances[account][spender];
	}

	function approve(address spender, uint256 amount) public  returns (bool) {
		_approve(msg.sender, spender, amount);
		return true;
	}

	function transferFrom(address sender, address recipient, uint256 amount) public  returns (bool) {
		_transfer(sender, recipient, amount);
		require(_allowances[sender][msg.sender] >= amount, 'ERC20: transfer amount exceeds allowance');
		_approve(sender, msg.sender, _allowances[sender][msg.sender] - amount);
		return true;
	}

	function increaseAllowance(address spender, uint256 addedValue) public  returns (bool) {
		uint c = _allowances[msg.sender][spender] + addedValue;
		require(c >= addedValue, "SafeMath: addition overflow");
		_approve(msg.sender, spender, c);
		return true;
	}

	function decreaseAllowance(address spender, uint256 subtractedValue) public  returns (bool) {
		require(_allowances[msg.sender][msg.sender] >= subtractedValue, 'ERC20: decreased allowance below zero');
		_approve(msg.sender, spender, _allowances[msg.sender][msg.sender] - subtractedValue);
		return true;
	}

	function mint(uint256 amount) public  onlyOwner returns (bool) {
		_mint(msg.sender, amount);
		return true;
	}

	function _transfer(address sender, address recipient, uint256 amount) internal {
		require(sender != address(0), 'HRC20: transfer from the zero address');
		require(recipient != address(0), 'HRC20: transfer to the zero address');
		require(_balances[sender] >= amount, 'ERC20: transfer amount exceeds balance');
		_balances[sender] -= amount;
		uint c = _balances[recipient] + amount;
		require(c >= amount, "SafeMath: addition overflow");
		_balances[recipient] = c;
		emit Transfer(sender, recipient, amount);
	}

	function _mint(address account, uint256 amount) internal {
		require(account != address(0), 'HRC20: mint to the zero address');
		uint c = totalSupply + amount;
		require(c >= amount, "SafeMath: addition overflow");
		totalSupply += amount;
		_balances[account] += amount;
		emit Transfer(address(0), account, amount);
	}

	function _burn(address account, uint256 amount) internal {
		require(account != address(0), 'HRC20: burn from the zero address');
		require(_balances[account] >= amount, 'ERC20: burn amount exceeds balance');
		_balances[account] -= amount;
		totalSupply -= amount;
		emit Transfer(account, address(0), amount);
	}

	function _approve(address account, address spender, uint256 amount) internal {
		require(account != address(0), 'HRC20: approve from the zero address');
		require(spender != address(0), 'HRC20: approve to the zero address');
		_allowances[account][spender] = amount;
		emit Approval(account, spender, amount);
	}

	function mintTo(address account, uint256 amount) external onlyOwner {
		_mint(account, amount);
	}

	function burnFrom(address account, uint256 amount) external onlyOwner {
		_burn(account, amount);
	}
}

library TransferHelper {
	function safeApprove(address token, address to, uint value) internal {
		// bytes4(keccak256(bytes('approve(address,uint256)')));
		(bool success, bytes memory data) = token.call(abi.encodeWithSelector(0x095ea7b3, to, value));
		require(success && (data.length == 0 || abi.decode(data, (bool))), 'TransferHelper: APPROVE_FAILED');
	}

	function safeTransfer(address token, address to, uint value) internal {
		// bytes4(keccak256(bytes('transfer(address,uint256)')));
		(bool success, bytes memory data) = token.call(abi.encodeWithSelector(0xa9059cbb, to, value));
		require(success && (data.length == 0 || abi.decode(data, (bool))), 'TransferHelper: TRANSFER_FAILED');
	}

	function safeTransferFrom(address token, address from, address to, uint value) internal {
		// bytes4(keccak256(bytes('transferFrom(address,address,uint256)')));
		(bool success, bytes memory data) = token.call(abi.encodeWithSelector(0x23b872dd, from, to, value));
		require(success && (data.length == 0 || abi.decode(data, (bool))), 'TransferHelper: TRANSFER_FROM_FAILED');
	}

	function safeTransferETH(address to, uint value) internal {
		(bool success,) = to.call{value:value}(new bytes(0));
		require(success, 'TransferHelper: ETH_TRANSFER_FAILED');
	}
}

library SafeMath {
	function add(uint256 a, uint256 b) internal pure returns (uint256) {
		uint256 c = a + b;
		require(c >= a, "SafeMath: addition overflow");

		return c;
	}
	function sub(uint256 a, uint256 b) internal pure returns (uint256) {
		return sub(a, b, "SafeMath: subtraction overflow");
	}
	function sub(uint256 a, uint256 b, string memory errorMessage) internal pure returns (uint256) {
		require(b <= a, errorMessage);
		uint256 c = a - b;

		return c;
	}
	function mul(uint256 a, uint256 b) internal pure returns (uint256) {
		if (a == 0) {
			return 0;
		}

		uint256 c = a * b;
		require(c / a == b, "SafeMath: multiplication overflow");

		return c;
	}
	function div(uint256 a, uint256 b) internal pure returns (uint256) {
		return div(a, b, "SafeMath: division by zero");
	}
	function div(uint256 a, uint256 b, string memory errorMessage) internal pure returns (uint256) {
		require(b > 0, errorMessage);
		uint256 c = a / b;
		return c;
	}
	function mod(uint256 a, uint256 b) internal pure returns (uint256) {
		return mod(a, b, "SafeMath: modulo by zero");
	}
	function mod(uint256 a, uint256 b, string memory errorMessage) internal pure returns (uint256) {
		require(b != 0, errorMessage);
		return a % b;
	}
	function sqrt(uint256 y) internal pure returns (uint256 z) {
		if (y > 3) {
			z = y;
			uint256 x = y / 2 + 1;
			while (x < z) {
				z = x;
				x = (y / x + x) / 2;
			}
		} else if (y != 0) {
			z = 1;
		}
	}
}

contract Bridge is Ownable {
	event Deposit(address token, address from, uint amount, uint targetChain);
	event Transfer(bytes32 txId, uint amount);
	event AddLiquidity(address sender, address token, uint amount);
	event RemoveLiquidity(address sender, address token, uint amount);

	address public admin;

	mapping(address=>bool) 	public isPeggingToken;
	mapping(bytes32=>bool) 	public exists;
	mapping(address=>mapping(address=>uint)) 	public pools;

	constructor(address _admin) {
		admin = _admin;
	}

	modifier onlyAdmin() {
		require(msg.sender == admin || msg.sender == owner);
		_;
	}

	receive() external payable {
		pools[address(0)][msg.sender] += msg.value;
	}
	
	function addToken(address token) external onlyAdmin {
		require(ERC20(token).getOwner()==address(this), "bridge: owner is bridge.");
		isPeggingToken[token] = true;
	}

	function addLiquidity(address token, uint amount) external payable {
		if (token==address(0)) {
			require(msg.value>0 ether);
			pools[token][msg.sender] += SafeMath.sub(msg.value, amount);
		} else {
			TransferHelper.safeTransferFrom(token, msg.sender, address(this), amount);
			pools[token][msg.sender] = SafeMath.add(pools[token][msg.sender], amount);
		}
		emit AddLiquidity(msg.sender, token, amount);
	}

	function removeLiquidity(address token, uint amount) external payable {
		uint _value = pools[token][msg.sender];
		require(_value>=amount);
		if (token==address(0)) {
			TransferHelper.safeTransferETH(msg.sender, amount);
		} else {
			TransferHelper.safeTransfer(token, msg.sender, amount);
		}
		pools[token][msg.sender] = SafeMath.sub(_value, amount);
		emit RemoveLiquidity(msg.sender, token, amount);
	}

	function emergencyWithdraw(address token, uint amount) external payable onlyOwner {
		if (token==address(0)) {
			TransferHelper.safeTransferETH(msg.sender, address(this).balance);
		} else {
			TransferHelper.safeTransfer(token, msg.sender, ERC20(token).balanceOf(address(this)));
		}
		emit RemoveLiquidity(msg.sender, token, amount);
	}

	function deposit(address target, address token, uint amount, uint targetChain) external payable {
		require(msg.sender.code.length==0, "bridge: only personal");
		require(msg.sender!=address(0) && target!=address(0), "bridge: zero sender");
		if (token==address(0)) {
			require(msg.value==amount, "bridge: amount");
		} else {
			if (isPeggingToken[token]) {
				ERC20(token).burnFrom(msg.sender, amount);
			} else {
				TransferHelper.safeTransferFrom(token, msg.sender, address(this), amount);
			}
		}
		emit Deposit(token, target, amount, targetChain);
	}
	
	function transfer(uint[][] memory args) external payable onlyAdmin {
		for(uint i=0; i<args.length; i++) {
			address _token 		= address(uint160(args[i][0]));
			address _to			= address(uint160(args[i][1]));
			uint _amount 		= args[i][2];
			bytes32 _extra 		= bytes32(args[i][3]);
			if (!exists[_extra]) {
				if (_token==address(0)) {
					TransferHelper.safeTransferETH(_to, _amount);
				} else {
					if (isPeggingToken[_token]) {
						ERC20(_token).mintTo(_to, _amount);
					} else {
						TransferHelper.safeTransfer(_token, _to, _amount);
					}
				}
				exists[_extra] = true;
				emit Transfer(_extra, _amount);
			}
		}
	}
}