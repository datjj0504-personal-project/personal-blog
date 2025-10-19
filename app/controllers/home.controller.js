exports.getHomePage = (req, res) => {
	console.log('Homepage accessed...');
	res.send('This is the homepage');
};