import React from 'react';

const ConfirmBox = ({ show, title, message, onConfirm, onCancel }) => {
	return (
		<div className={`confirm-box ${show ? 'show' : 'hidden no_display'}`}>
			<div className='confirm-box__content'>
				<div className='confirm-box__title'>{title}</div>
				<div className='confirm-box__message'>{message}</div>
				<div className='confirm-box__actions'>
					<button className='confirm-box__action confirm-box__action--cancel' onClick={() => onCancel()}>
						Cancel
					</button>
					<button className='confirm-box__action confirm-box__action--confirm' onClick={() => onConfirm()}>
						Confirm
					</button>
				</div>
			</div>
		</div>
	);
};

export default ConfirmBox;
