const Wrapper = ({ elements = { top: null, button: null }, children }) => {
	return (
		<div className='wrapper'>
			<div className='wrapper_header'>
				{elements.top}
				<h1>Scoreboard</h1>
				{elements.bottom}
			</div>
			{children}
		</div>
	);
};

export default Wrapper;
