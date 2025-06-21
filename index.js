import { tweetsData as defaultTweetsData } from './data.js' /*The name tweetsData is already used for the imported constant — and you can't reassign it. So by calling it another name when we import it, we are now free to create a let (so it can be reassigned) tweetsData parsing through JSON so we can save to localStorage. Even though tweetsData was exported as let, you can't reassign it when you import it. So yes — you still need to rename it when importing*/
import { v4 as uuidv4 } from 'https://jspm.dev/uuid';

let tweetsData = JSON.parse(localStorage.getItem("tweetsData")) || defaultTweetsData /*we need to save to a let so if there's nothing in localStorage it's value can change back to defaultTweetsData which is the original array imported.
Also, localStorage.getItem(...) returns a string, so you need to parse it with JSON.parse(...)

"tweetsData" is a string key, not a variable

If there’s nothing in localStorage yet, fallback to your defaultTweetsData */

let tweets = []

document.addEventListener('click', function(e){
    if(e.target.dataset.like){
       handleLikeClick(e.target.dataset.like) 
    }
    else if(e.target.dataset.retweet){
        handleRetweetClick(e.target.dataset.retweet)
    }
    else if(e.target.dataset.reply){
        handleReplyClick(e.target.dataset.reply)
    }
    else if(e.target.id === 'tweet-btn'){
        handleTweetBtnClick()
    }
    else if(e.target.dataset.renderNewReplyBtn) {
        renderReplyBtnClick(e.target.dataset.renderNewReplyBtn)
    }
    else if(e.target.dataset.closeRepliesBtn) {
        closeRepliesBtnClick(e.target.dataset.closeRepliesBtn)
    }
    else if(e.target.dataset.deleteTweet) {
        deleteTweetClick(e.target.dataset.deleteTweet)
    }
    else if(e.target.dataset.replyLike) {
        handleLikeClick(e.target.dataset.replyLike)
    }
    else if(e.target.dataset.replyRetweet) {
        handleRetweetClick(e.target.dataset.replyRetweet)
    }
})            
            
function findTweetOrReplyById(id) { /*This function is being used to update your logic to search both tweetsData and any nested replies to correctly find the tweet or reply being interacted with and we calling it in the button functions*/
    for (let tweet of tweetsData) {
        if (tweet.uuid === id) {
            return tweet
        }
        for(let reply of tweet.replies) {
            if (reply.uuid === id) {
                return reply
            }
        }
    }
    return null
}
 
function handleLikeClick(id){ 
    // const targetTweetObj = tweetsData.filter(function(tweet){
    //     return tweet.uuid === tweetId
    // })[0] (for just top tweets won't search for functionality on replies)
    
    // const replyLikeBtn = document.querySelector(`i[data-reply-retweet="${id}"]`)
    // replyLikeBtn.classList.toggle("liked") /* Find a way to actually do this */
    
    const targetTweetObj = findTweetOrReplyById(id)

    if(targetTweetObj) {
        if('isLiked' in targetTweetObj) {
            if(targetTweetObj.isLiked) {
                targetTweetObj.likes--
            }
            else{
                targetTweetObj.likes++
            }
            targetTweetObj.isLiked = !targetTweetObj.isLiked
        }
        else if('replyIsLiked' in targetTweetObj) {
            if(targetTweetObj.replyIsLiked) {
                targetTweetObj.likes--
            }
            else {
                targetTweetObj.likes++
            }
            targetTweetObj.replyIsLiked = !targetTweetObj.replyIsLiked
        }
    
        localStorage.setItem("tweetsData", JSON.stringify(tweetsData))
        render()
    }
}

function handleRetweetClick(id){
    // const targetTweetObj = tweetsData.filter(function(tweet){
    //     return tweet.uuid === tweetId
    // })[0] (for just top tweets won't search for functionality on replies)
    
    const targetTweetObj = findTweetOrReplyById(id)
    
    if(targetTweetObj) {
        if('isRetweeted' in targetTweetObj) {
            if(targetTweetObj.isRetweeted) {
                targetTweetObj.retweets--
            }
            else{
                targetTweetObj.retweets++
            }
            targetTweetObj.isRetweeted = !targetTweetObj.isRetweeted
        }
        else if('replyIsRetweeted' in targetTweetObj) {
            if(targetTweetObj.replyIsRetweeted) {
                targetTweetObj.retweets--
            }
            else{
                targetTweetObj.retweets++
            }
            targetTweetObj.replyIsRetweeted = !targetTweetObj.replyIsRetweeted
        }
        
        localStorage.setItem("tweetsData", JSON.stringify(tweetsData))
        render() 
    }
}

function deleteTweetClick(tweetId) {
    const confirmDelete = confirm("Are you sure you want to delete this tweet?")
    
    if(confirmDelete) {
        const tweetIndex = tweetsData.findIndex(tweet => tweet.uuid === tweetId) 

        if(tweetIndex !== -1) {
            tweetsData.splice(tweetIndex, 1)
        }
        else {
            for(let tweet of tweetsData) {
                const replyIndex = tweet.replies.findIndex(reply => reply.uuid === tweetId)
                
                if (replyIndex !== -1) {
                    tweet.replies.splice(replyIndex, 1)
                }
            }
        }

        localStorage.setItem("tweetsData", JSON.stringify(tweetsData))
        
        render()
    }
    
}

function handleReplyClick(replyId){
    const tweetReplyInner = document.querySelector(`div[data-tweet-reply-inner="${replyId}"]`)
    
    tweetReplyInner.classList.remove("hidden")
    
    document.getElementById(`replies-${replyId}`).classList.toggle('hidden')
}

function handleTweetBtnClick(){
    const tweetInput = document.getElementById('tweet-input')

    if(tweetInput.value){
        tweetsData.unshift({
            handle: `@Scrimba`,
            profilePic: `images/scrimbalogo.png`,
            likes: 0,
            retweets: 0,
            tweetText: tweetInput.value.trim(),
            replies: [],
            isLiked: false,
            isRetweeted: false,
            uuid: uuidv4()
        })
    localStorage.setItem("tweetsData", JSON.stringify(tweetsData))
    render()
    tweetInput.value = ''
    }
}

function renderReplyBtnClick(tweetId) {
    const replyTextArea = document.querySelector(`textarea[data-replytextarea="${tweetId}"]`)
    
    if(!replyTextArea.value) {
        return
    }
    const targetTweet = tweetsData.filter(function(tweet) {
        return tweet.uuid === tweetId
    })[0]
    
    
    if(targetTweet) {
        targetTweet.replies.unshift(
            {
                handle: "@thePrincessHerself ✅",
                profilePic: "/images/PrincessDp.png",
                tweetText: replyTextArea.value.trim(),
                replies: [],
                likes: 0,
                retweets: 0,
                replyIsLiked: false,
                replyIsRetweeted: false,
                uuid: uuidv4()
            }
        )
    }
        
        
    
    localStorage.setItem("tweetsData", JSON.stringify(tweetsData))
    render()
    replyTextArea.value = ""
}

function closeRepliesBtnClick(tweetId) {
    const tweetReplyInner = document.querySelector(`div[data-tweet-reply-inner="${tweetId}"]`)
    tweetReplyInner.classList.add("hidden")
}

function getFeedHtml(id){
    let feedHtml = ``
    
    tweetsData.forEach(function(tweet){
        
        let likeIconClass = ''
        let retweetIconClass = ''
        let replyLikeIconClass = ''
        let replyRetweetIconClass = ''
        
        if (tweet.isLiked){
            likeIconClass = 'liked'
        }
        
        
        if (tweet.isRetweeted){
            retweetIconClass = 'retweeted'
        }
        
        tweet.replies.forEach(function(reply) {
            if (reply.replyIsLiked && reply.likes.length >= 0) {
                replyLikeIconClass = 'liked'
            }
        })
        

        
        let repliesHtml = ''
        
        if(tweet.replies.length > 0){
            tweet.replies.forEach(function(reply){
                repliesHtml+=`
                <div class="tweet-reply">
                    <div class="tweet-inner">
                        <img src="${reply.profilePic}" class="profile-pic">
                            <div>
                                <p class="handle">${reply.handle}</p>
                                <p class="tweet-text">${reply.tweetText}</p>
                                <div class="tweet-details">
                                    <span class="tweet-detail">
                                        <i class="fa-regular fa-comment-dots"
                                        data-reply="${reply.uuid}"
                                        ></i>
                                        ${reply.replies ? reply.replies.length : 0}
                                    </span>
                                    <span class="tweet-detail">
                                        <i class="fa-solid fa-heart ${replyLikeIconClass}"
                                        data-reply-like="${reply.uuid}"
                                        ></i>
                                        ${reply.likes}
                                    </span>
                                    <span class="tweet-detail">
                                        <i class="fa-solid fa-retweet ${replyRetweetIconClass}"
                                        data-reply-retweet="${reply.uuid}"
                                        ></i>
                                        ${reply.retweets}
                                    </span>
                                    <span class="tweet-detail">
                                    <i class="fa-solid fa-trash"
                                        data-delete-tweet="${reply.uuid}"
                                        ></i>
                                    </span>
                                </div>   
                            </div>
                        </div>
                </div>
                `
            })
        }
        
          
        feedHtml += `
<div class="tweet" data-tweet-feed="${tweet.uuid}">
    <div class="tweet-inner">
        <img src="${tweet.profilePic}" class="profile-pic">
        <div>
            <p class="handle">${tweet.handle}</p>
            <p class="tweet-text">${tweet.tweetText}</p>
            <div class="tweet-details">
                <span class="tweet-detail">
                    <i class="fa-regular fa-comment-dots"
                    data-reply="${tweet.uuid}"
                    ></i>
                    ${tweet.replies.length}
                </span>
                <span class="tweet-detail">
                    <i class="fa-solid fa-heart ${likeIconClass}"
                    data-like="${tweet.uuid}"
                    ></i>
                    ${tweet.likes}
                </span>
                <span class="tweet-detail">
                    <i class="fa-solid fa-retweet ${retweetIconClass}"
                    data-retweet="${tweet.uuid}"
                    ></i>
                    ${tweet.retweets}
                </span>
                <span class="tweet-detail">
                   <i class="fa-solid fa-trash"
                    data-delete-tweet="${tweet.uuid}"
                    ></i>
                 </span>
            </div>   
        </div>            
    </div>
    <div class="hidden" id="replies-${tweet.uuid}">
        <div class="tweet-reply-inner" data-tweet-reply-inner="${tweet.uuid}">
            <div class="tweet-inner reply-area-btn"> 
                <button data-close-replies-btn="${tweet.uuid}" class="close-reply-btn">X</button>
                <button data-render-new-reply-btn="${tweet.uuid}" class="reply-btn">Reply</button>
            </div> 
            <div class="tweet-inner"> 
                <img src="/images/PrincessDp.png" class="profile-pic reply-dp">
                <div> 
                    <p class="handle reply-handle">Replying to ${tweet.handle}</p>
                    <textarea placeholder="Post your reply" data-replytextarea="${tweet.uuid}"></textarea>
                </div>
            </div>
        </div>
        ${repliesHtml}
    </div>   
</div>
`
   })
   return feedHtml 
}

function render(){
    document.getElementById('feed').innerHTML = getFeedHtml()
}

render()

