import React, { Component } from 'react';
import axios from 'axios';
import Dropdown from 'react-bootstrap/Dropdown';
import '../Styles/AdminPanel.css'; // Import the separate CSS file

class AdminPanel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      openDropdownId: null,
      chatList: [],
    };
  }

  componentDidMount() {
    this.fetchData();
  }

  fetchData = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:5002/get-chats-admin', { params: { user_type: 'admins' } });
      this.setState({ chatList: response.data });
    } catch (error) {
      console.error('Error fetching flagged conversations:', error);
    }
  };

  toggleDropdown = (conversationId) => {
    this.setState((prevState) => ({
      openDropdownId: prevState.openDropdownId === conversationId ? null : conversationId,
    }));
  };

  handleOptionSelect = (conversationId, action) => {
    // Perform action based on the selected option
    if (action === 'delete') {
      this.deleteConversation(conversationId);
    } else if (action === 'resolve') {
      this.resolveConversation(conversationId);
    }
    // After performing the action, you might want to hide the dropdown
    this.setState({ openDropdownId: null });
  };

  deleteConversation = async (conversationId) => {
    try {
      await axios.put(`http://127.0.0.1:5002/delete-conversation/${conversationId}`, { deleted: true });
      this.fetchData(); // Refresh conversation list
    } catch (error) {
      console.error(`Error deleting conversation with ID ${conversationId}:`, error);
    }
  };

  resolveConversation = async (conversationId) => {
    try {
      await axios.put(`http://127.0.0.1:5002/resolve-conversation/${conversationId}`, { flagged: false });
      this.fetchData(); // Refresh conversation list
    } catch (error) {
      console.error(`Error resolving conversation with ID ${conversationId}:`, error);
    }
  };

  render() {
    const { chatList, openDropdownId } = this.state;

    return (
      <div className="admin-panel">
        <main className="main">
          <h1 className="title">Flagged Conversations (Admin)</h1>
          <table className="table">
            <thead>
              <tr>
                <th>Company</th>
                <th>User</th>
                <th>Flagging Reason</th>
                <th>Date</th>
                <th></th> {/* For the options button */}
              </tr>
            </thead>
            <tbody>
              {chatList.map((conversation) => (
                <tr key={conversation.id}>
                  <td className="logo-cell">
                    {/* <img 
                      src={conversation.companyLogo} 
                      alt={`${conversation.company} logo`} 
                      className="company-logo"
                    /> */}
                    {conversation.recruiter_company}
                  </td>
                  <td>{conversation.sender}</td>
                  <td>{conversation.flagged_reason}</td>
                  <td>{conversation.date}</td>
                  <td className="options" style={{ position: 'relative' }}>
                    <Dropdown>
                      <Dropdown.Toggle>
                      </Dropdown.Toggle>
                      <Dropdown.Menu>
                        <Dropdown.Item onClick={() => this.handleOptionSelect(conversation.id, 'delete')}>Delete</Dropdown.Item>
                        <Dropdown.Item onClick={() => this.handleOptionSelect(conversation.id, 'resolve')}>Resolve</Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </main>
      </div>
    );
  }
}

export default AdminPanel;
