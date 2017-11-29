import logging

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.DEBUG)


class PathProcessor:
    def __init__(self, resp):
        logger.info("Initialization")
        self.resp = resp
            
    def getMinMaxAvgTripTime(self):
        min_val = max_val = avg_val = 0
        timelist, duration_list = zip(*(self.resp))
        duration_int_list = [int(elem) for elem in duration_list]
        min_val = min(duration_int_list)
        max_val = max(duration_int_list)
        curr_val = duration_list[0]
        return (min_val, max_val, curr_val)

    def finalise(self):
        return self.resp

    def getDetails(self):
        (min, max, curr) = self.getMinMaxAvgTripTime()
        print min, max, curr
        return(min, max, curr)
