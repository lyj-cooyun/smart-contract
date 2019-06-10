pragma solidity >=0.4.22 <0.6.0;

contract MyBallot {

    address public chairman;
    
    struct Proposal {
        bytes32 name;
        uint voteCount;
    }

    Proposal[] public proposals;

    constructor(bytes32[] memory proposalNames) public {
        chairman = msg.sender;
        for(uint i=0;i<proposalNames.length;i++) {
            proposals.push(Proposal({
                name: proposalNames[i],
                voteCount: 0
            }));
        }
    }
    function vote(uint toProposalIndex) public {
        proposals[toProposalIndex].voteCount += 1;

    }
    function stateOfProposal(uint proposalIndex) public view returns (uint voteCount) {
        return proposals[proposalIndex].voteCount; 
    }
}
